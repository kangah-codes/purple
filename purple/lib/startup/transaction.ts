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
    // Ensure console.* is patched to persist logs to disk.
    // (Safe to call multiple times; returns existing installed logger.)
    installExportLogger({ enabled: true });

    console.log('[RecurringTx] Starting processRecurringTransactions');
    const now = new Date();
    console.log('[RecurringTx] Current time:', now.toISOString());

    const stats: ProcessingStats = {
        totalProcessed: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        results: [],
    };

    // Fetch all active recurring transactions that have a next creation date
    const recurringTxs: Array<RecurringTransaction & { account_currency: string }> =
        await db.getAllAsync<any>(
            `SELECT rt.*, a.currency AS account_currency FROM recurring_transactions rt
            JOIN accounts a ON a.id = rt.account_id
            WHERE rt.status = 'active'
            AND rt.create_next_at_unix IS NOT NULL`,
            [],
        );

    console.log(`[RecurringTx] Found ${recurringTxs.length} active recurring transactions`);
    if (recurringTxs.length === 0) {
        console.log('[RecurringTx] No recurring transactions to process');
        return stats;
    }

    for (const recurring of recurringTxs) {
        console.log(`[RecurringTx] Processing recurring transaction ${recurring.id}:`);
        console.log(`  - Category: ${recurring.category}`);
        console.log(`  - Type: ${recurring.type}`);
        console.log(`  - Amount: ${recurring.amount}`);
        console.log(`  - Next at (unix): ${recurring.create_next_at_unix}`);
        console.log(
            `  - Next at (date): ${new Date(recurring.create_next_at_unix * 1000).toISOString()}`,
        );
        console.log(`  - Recurrence rule: ${recurring.recurrence_rule}`);
        console.log(`  - Start date (unix): ${recurring.start_date_unix}`);
        console.log(
            `  - Start date (date): ${new Date(recurring.start_date_unix * 1000).toISOString()}`,
        );

        try {
            const results = await processRecurringTransaction(db, recurring, now);
            console.log(
                `[RecurringTx] Completed processing ${recurring.id}, created ${results.length} transactions`,
            );
            stats.results.push(...results);
            stats.totalProcessed += results.length;
            stats.successfulTransactions += results.filter((r) => r.success).length;
            stats.failedTransactions += results.filter((r) => !r.success).length;
        } catch (error) {
            console.error(
                `[RecurringTx] Failed to process recurring transaction ${recurring.id}:`,
                error,
            );
            stats.results.push({
                success: false,
                recurringTransactionId: recurring.id,
                transactionDate: new Date(recurring.create_next_at_unix * 1000),
                error: error instanceof Error ? error : new Error('Unknown error'),
            });
            stats.failedTransactions++;
        }
    }

    console.log(`[RecurringTx] Final stats:`, {
        totalProcessed: stats.totalProcessed,
        successful: stats.successfulTransactions,
        failed: stats.failedTransactions,
    });
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
    console.log(`[RecurringTx] Processing individual transaction ${recurring.id}`);
    const results: ProcessingResult[] = [];

    try {
        const rule = RRule.fromString(recurring.recurrence_rule);
        console.log(`[RecurringTx] Parsed RRule for ${recurring.id}:`, rule.toString());

        const nextExpected = new Date(recurring.create_next_at_unix * 1000);
        console.log(
            `[RecurringTx] Next expected date for ${recurring.id}:`,
            nextExpected.toISOString(),
        );
        console.log(`[RecurringTx] Current time:`, now.toISOString());
        console.log(`[RecurringTx] Is due? ${nextExpected <= now}`);

        // If the next expected date is in the future, nothing to process
        if (nextExpected > now) {
            console.log(
                `[RecurringTx] Recurring transaction ${recurring.id} not due yet:`,
                'Next at:',
                nextExpected.toISOString(),
                'Rule:',
                recurring.recurrence_rule,
            );
            return results;
        }

        // Find all occurrences from nextExpected up to now using the more reliable helper
        const dtStart = new Date(recurring.start_date_unix * 1000);
        console.log(
            `[RecurringTx] Finding occurrences between ${nextExpected.toISOString()} and ${now.toISOString()}`,
        );
        console.log(`[RecurringTx] Start date for rule: ${dtStart.toISOString()}`);

        const missedOccurrences = occurrencesBetween(
            recurring.recurrence_rule,
            dtStart,
            nextExpected,
            now,
        );
        console.log(
            `[RecurringTx] Found ${missedOccurrences.length} occurrences from occurrencesBetween`,
        );

        // If no occurrences found using between(), but nextExpected <= now,
        // it means we should create at least one transaction for nextExpected
        if (missedOccurrences.length === 0 && nextExpected <= now) {
            console.log(`[RecurringTx] No occurrences found but date is due, adding nextExpected`);
            missedOccurrences.push(nextExpected);
        }

        console.log(
            `[RecurringTx] Processing ${missedOccurrences.length} missed occurrences for recurring transaction ${recurring.id}`,
        );
        missedOccurrences.forEach((occ, idx) => {
            console.log(`  [${idx + 1}] ${occ.toISOString()}`);
        });

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

        // Create transactions for all missed occurrences
        let lastSuccessfulOccurrence: Date | null = null;
        for (const occurrenceDate of missedOccurrences) {
            console.log(
                `[RecurringTx] Creating transaction for ${
                    recurring.id
                } at ${occurrenceDate.toISOString()}`,
            );
            try {
                const budgetId =
                    shouldCountInBudget && recurring.type === 'debit'
                        ? await getBudgetIdForDate(db, occurrenceDate)
                        : null;

                await createRecurringTransaction(transactionService, recurring, occurrenceDate, {
                    useTransaction: false,
                    budgetId,
                });
                console.log(
                    `[RecurringTx] Successfully created transaction for ${occurrenceDate.toISOString()}`,
                );
                results.push({
                    success: true,
                    recurringTransactionId: recurring.id,
                    transactionDate: occurrenceDate,
                });
                lastSuccessfulOccurrence = occurrenceDate;
            } catch (error) {
                console.error(
                    `[RecurringTx] Failed to create transaction for ${occurrenceDate.toISOString()}:`,
                    error,
                );
                results.push({
                    success: false,
                    recurringTransactionId: recurring.id,
                    transactionDate: occurrenceDate,
                    error: error instanceof Error ? error : new Error('Unknown error'),
                });
            }
        }

        // Only advance schedule if at least one transaction was successfully created
        if (lastSuccessfulOccurrence) {
            const nextOccurrence = rule.after(lastSuccessfulOccurrence, false);
            console.log(`[RecurringTx] Advancing schedule for ${recurring.id}`);
            console.log(`  - Last created: ${lastSuccessfulOccurrence.toISOString()}`);
            console.log(
                `  - Next occurrence: ${
                    nextOccurrence ? nextOccurrence.toISOString() : 'null (ended)'
                }`,
            );
            await updateRecurringTransactionSchedule(
                db,
                recurring,
                nextOccurrence,
                lastSuccessfulOccurrence,
            );
        } else {
            console.warn(
                `[RecurringTx] No successful creations for recurring ${recurring.id}; schedule not advanced`,
            );
        }

        console.log(`[RecurringTx] COMPLETED ${recurring.id}:`, results);
    } catch (error) {
        console.error(`Error processing recurring transaction ${recurring.id}:`, error);
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
    console.log(`[RecurringTx] Creating recurring transaction:`);
    console.log(`  - Recurring ID: ${recurring.id}`);
    console.log(`  - Account ID: ${recurring.account_id}`);
    console.log(`  - Type: ${recurring.type}`);
    console.log(`  - Amount: ${recurring.amount}`);
    console.log(`  - Category: ${recurring.category}`);
    console.log(`  - Currency: ${recurring.account_currency}`);
    console.log(`  - Occurrence Date: ${occurrenceDate.toISOString()}`);

    const baseTransaction = {
        account_id: recurring.account_id,
        type: recurring.type,
        amount: recurring.amount,
        category: recurring.category,
        currency: recurring.account_currency,
        date: occurrenceDate.toISOString(),
        charges: 0,
        budget_id: options?.budgetId ?? undefined,
    };

    if (recurring.type === 'transfer') {
        console.log(
            `[RecurringTx] Creating transfer transaction from ${recurring.from_account} to ${recurring.to_account}`,
        );
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
        console.log(`[RecurringTx] Creating ${recurring.type} transaction`);
        await transactionService.create(
            {
                ...baseTransaction,
                note: `Recurring transaction for ${recurring.category}`,
            },
            options,
        );
    }
    console.log(`[RecurringTx] Successfully created transaction in database`);
}

async function updateRecurringTransactionSchedule(
    db: SQLiteDatabase,
    recurring: RecurringTransaction,
    nextOccurrence: Date | null,
    lastCreatedAt: Date,
): Promise<void> {
    const lastCreatedUnix = dateToUNIX(lastCreatedAt);
    const nextOccurrenceUnix = nextOccurrence ? dateToUNIX(nextOccurrence) : null;

    console.log(`[RecurringTx] Updating schedule for ${recurring.id}:`);
    console.log(`  - Last created at: ${lastCreatedAt.toISOString()} (unix: ${lastCreatedUnix})`);
    console.log(
        `  - Next occurrence: ${
            nextOccurrence ? nextOccurrence.toISOString() : 'null'
        } (unix: ${nextOccurrenceUnix})`,
    );

    await db.runAsync(
        `UPDATE recurring_transactions
        SET create_next_at_unix = ?,
            create_next_at = datetime(?, 'unixepoch'),
            last_created_at = datetime(?, 'unixepoch'),
            last_created_at_unix = ?
        WHERE id = ?`,
        [nextOccurrenceUnix, nextOccurrenceUnix, lastCreatedUnix, lastCreatedUnix, recurring.id],
    );

    console.log(`[RecurringTx] Successfully updated schedule for ${recurring.id}`);
}
