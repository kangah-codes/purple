import { RRule } from 'rrule';
import { dateToUNIX } from '../utils/date';
import { SQLiteDatabase } from 'expo-sqlite';
import { RecurringTransaction } from '@/components/Transactions/schema';
import { TransactionSQLiteService } from '../services/TransactionSQLiteService';
import { occurrencesBetween } from '../utils/rrule';
import { installExportLogger } from '../utils/exportLogger';
import { format } from 'date-fns';

export interface ProcessingResult {
    success: boolean;
    recurringTransactionId: string;
    transactionDate: Date;
    error?: Error;
}

export interface ProcessingStats {
    totalProcessed: number;
    successfulTransactions: number;
    failedTransactions: number;
    results: ProcessingResult[];
}

export async function processRecurringTransactions(db: SQLiteDatabase): Promise<ProcessingStats> {
    // Defer logger installation to avoid blocking
    setImmediate(() => {
        installExportLogger({ enabled: true });
    });

    const now = new Date();
    const stats: ProcessingStats = {
        totalProcessed: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        results: [],
    };

    const recurringTxs: Array<RecurringTransaction & { account_currency: string }> =
        await db.getAllAsync<any>(
            `SELECT rt.*, a.currency AS account_currency FROM recurring_transactions rt
            JOIN accounts a ON a.id = rt.account_id
            WHERE rt.status = 'active'
            AND rt.create_next_at_unix IS NOT NULL`,
            [],
        );

    if (recurringTxs.length === 0) {
        return stats;
    }

    // Process all recurring transactions in parallel for better performance
    const processingPromises = recurringTxs.map(async (recurring) => {
        try {
            return await processRecurringTransaction(db, recurring, now);
        } catch (error) {
            return [{
                success: false,
                recurringTransactionId: recurring.id,
                transactionDate: new Date(recurring.create_next_at_unix * 1000),
                error: error instanceof Error ? error : new Error('Unknown error'),
            }] as ProcessingResult[];
        }
    });

    const allResults = await Promise.all(processingPromises);

    // Count stats in a single pass instead of multiple filter operations
    for (const results of allResults) {
        stats.results.push(...results);
        for (const result of results) {
            stats.totalProcessed++;
            if (result.success) {
                stats.successfulTransactions++;
            } else {
                stats.failedTransactions++;
            }
        }
    }

    return stats;
}

async function getBudgetIdForDate(db: SQLiteDatabase, date: Date): Promise<string | null> {
    const monthName = format(date, 'MMMM');
    const year = date.getFullYear();
    const row = await db.getFirstAsync<{ id: string }>(
        `SELECT id FROM budgets
         WHERE month = ? AND year = ? AND deleted_at IS NULL
         LIMIT 1`,
        [monthName, year],
    );
    return row?.id ?? null;
}

async function processRecurringTransaction(
    db: SQLiteDatabase,
    recurring: RecurringTransaction & { account_currency: string },
    now: Date,
): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];

    try {
        const rule = RRule.fromString(recurring.recurrence_rule);
        const nextExpected = new Date(recurring.create_next_at_unix * 1000);

        if (nextExpected > now) {
            return results;
        }

        const dtStart = new Date(recurring.start_date_unix * 1000);
        const missedOccurrences = occurrencesBetween(
            recurring.recurrence_rule,
            dtStart,
            nextExpected,
            now,
        );

        if (missedOccurrences.length === 0 && nextExpected <= now) {
            missedOccurrences.push(nextExpected);
        }

        const transactionService = new TransactionSQLiteService(db);

        const metadataRaw: any = (recurring as any).metadata;
        const metadata: any =
            typeof metadataRaw === 'string'
                ? (() => {
                      try {
                          return JSON.parse(metadataRaw);
                      } catch {
                          return {};
                      }
                  })()
                : metadataRaw ?? {};
        const shouldCountInBudget = Boolean(metadata?.count_in_budget);

        // Cache budget IDs by month to avoid repeated DB queries
        const budgetCache = new Map<string, string | null>();

        let lastSuccessfulOccurrence: Date | null = null;
        for (const occurrenceDate of missedOccurrences) {
            try {
                let budgetId: string | null = null;
                if (shouldCountInBudget && recurring.type === 'debit') {
                    const monthKey = `${format(occurrenceDate, 'MMMM')}-${occurrenceDate.getFullYear()}`;
                    if (budgetCache.has(monthKey)) {
                        budgetId = budgetCache.get(monthKey)!;
                    } else {
                        budgetId = await getBudgetIdForDate(db, occurrenceDate);
                        budgetCache.set(monthKey, budgetId);
                    }
                }

                await createRecurringTransaction(transactionService, recurring, occurrenceDate, {
                    useTransaction: false,
                    budgetId,
                });
                results.push({
                    success: true,
                    recurringTransactionId: recurring.id,
                    transactionDate: occurrenceDate,
                });
                lastSuccessfulOccurrence = occurrenceDate;
            } catch (error) {
                results.push({
                    success: false,
                    recurringTransactionId: recurring.id,
                    transactionDate: occurrenceDate,
                    error: error instanceof Error ? error : new Error('Unknown error'),
                });
            }
        }

        if (lastSuccessfulOccurrence) {
            const nextOccurrence = rule.after(lastSuccessfulOccurrence, false);
            await updateRecurringTransactionSchedule(
                db,
                recurring,
                nextOccurrence,
                lastSuccessfulOccurrence,
            );
        }
    } catch (error) {
        results.push({
            success: false,
            recurringTransactionId: recurring.id,
            transactionDate: new Date(recurring.create_next_at_unix * 1000),
            error: error instanceof Error ? error : new Error('Unknown error'),
        });
    }

    return results;
}

async function createRecurringTransaction(
    transactionService: TransactionSQLiteService,
    recurring: RecurringTransaction & { account_currency: string },
    occurrenceDate: Date,
    options?: { useTransaction?: boolean; budgetId?: string | null },
): Promise<void> {
    // Parse metadata to get original currency if stored
    const metadataRaw: any = (recurring as any).metadata;
    const metadata: any =
        typeof metadataRaw === 'string'
            ? (() => {
                  try {
                      return JSON.parse(metadataRaw);
                  } catch {
                      return {};
                  }
              })()
            : metadataRaw ?? {};

    // Use original currency from metadata if available, otherwise use account currency
    // This allows conversion to happen with the latest exchange rates
    const originalCurrency = metadata?.original_currency ?? recurring.account_currency;
    const originalAmount = metadata?.original_amount ?? recurring.amount;

    const baseTransaction = {
        account_id: recurring.account_id,
        type: recurring.type,
        amount: originalAmount, // Use original amount - conversion happens in create()
        category: recurring.category,
        currency: originalCurrency, // Use original currency - triggers conversion in create()
        date: occurrenceDate.toISOString(),
        charges: 0,
        budget_id: options?.budgetId ?? undefined,
    };

    if (recurring.type === 'transfer') {
        await transactionService.create(
            {
                ...baseTransaction,
                note: `Recurring transfer for ${recurring.category}`,
                from_account: recurring.from_account,
                to_account: recurring.to_account,
            },
            options,
        );
    } else {
        await transactionService.create(
            {
                ...baseTransaction,
                note: `Recurring transaction for ${recurring.category}`,
            },
            options,
        );
    }
}

async function updateRecurringTransactionSchedule(
    db: SQLiteDatabase,
    recurring: RecurringTransaction,
    nextOccurrence: Date | null,
    lastCreatedAt: Date,
): Promise<void> {
    const lastCreatedUnix = dateToUNIX(lastCreatedAt);
    const nextOccurrenceUnix = nextOccurrence ? dateToUNIX(nextOccurrence) : null;

    await db.runAsync(
        `UPDATE recurring_transactions
        SET create_next_at_unix = ?,
            create_next_at = datetime(?, 'unixepoch'),
            last_created_at = datetime(?, 'unixepoch'),
            last_created_at_unix = ?
        WHERE id = ?`,
        [nextOccurrenceUnix, nextOccurrenceUnix, lastCreatedUnix, lastCreatedUnix, recurring.id],
    );
}
