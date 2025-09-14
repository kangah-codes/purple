import { RRule } from 'rrule';
import { dateToUNIX } from '../utils/date';
import { SQLiteDatabase } from 'expo-sqlite';
import { RecurringTransaction } from '@/components/Transactions/schema';
import { TransactionSQLiteService } from '../services/TransactionSQLiteService';
import { occurrencesBetween } from '../utils/rrule';

// Result types for extensibility
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
    const now = new Date();
    const nowUnix = dateToUNIX(now);

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

    for (const recurring of recurringTxs) {
        try {
            const results = await processRecurringTransaction(db, recurring, now);
            stats.results.push(...results);
            stats.totalProcessed += results.length;
            stats.successfulTransactions += results.filter((r) => r.success).length;
            stats.failedTransactions += results.filter((r) => !r.success).length;
        } catch (error) {
            console.error(`Failed to process recurring transaction ${recurring.id}:`, error);
            stats.results.push({
                success: false,
                recurringTransactionId: recurring.id,
                transactionDate: new Date(recurring.create_next_at_unix * 1000),
                error: error instanceof Error ? error : new Error('Unknown error'),
            });
            stats.failedTransactions++;
        }
    }

    return stats;
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

        // If the next expected date is in the future, nothing to process
        if (nextExpected > now) {
            console.log(
                'Recurring transaction not due yet:',
                recurring.id,
                'Next at:',
                nextExpected,
                recurring.recurrence_rule,
            );
            return results;
        }

        // Find all occurrences from nextExpected up to now using the more reliable helper
        const dtStart = new Date(recurring.start_date_unix * 1000);
        const missedOccurrences = occurrencesBetween(
            recurring.recurrence_rule,
            dtStart,
            nextExpected,
            now,
        );

        // If no occurrences found using between(), but nextExpected <= now,
        // it means we should create at least one transaction for nextExpected
        if (missedOccurrences.length === 0 && nextExpected <= now) {
            missedOccurrences.push(nextExpected);
        }

        console.log(
            `Processing ${missedOccurrences.length} missed occurrences for recurring transaction ${recurring.id}`,
        );

        const transactionService = new TransactionSQLiteService(db);

        // Create transactions for all missed occurrences
        let lastSuccessfulOccurrence: Date | null = null;
        for (const occurrenceDate of missedOccurrences) {
            try {
                await createRecurringTransaction(transactionService, recurring, occurrenceDate, {
                    useTransaction: false,
                });
                results.push({
                    success: true,
                    recurringTransactionId: recurring.id,
                    transactionDate: occurrenceDate,
                });
                lastSuccessfulOccurrence = occurrenceDate;
            } catch (error) {
                console.error(`Failed to create transaction for ${occurrenceDate}:`, error);
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
            await updateRecurringTransactionSchedule(
                db,
                recurring,
                nextOccurrence,
                lastSuccessfulOccurrence,
            );
        } else {
            console.warn(
                `No successful creations for recurring ${recurring.id}; schedule not advanced`,
            );
        }

        console.log('COMPLETED:', results);
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
    options?: { useTransaction?: boolean },
): Promise<void> {
    const baseTransaction = {
        account_id: recurring.account_id,
        type: recurring.type,
        amount: recurring.amount,
        category: recurring.category,
        currency: recurring.account_currency,
        date: occurrenceDate.toISOString(),
        charges: 0,
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

    await db.runAsync(
        `UPDATE recurring_transactions
        SET create_next_at_unix = ?,
            create_next_at = datetime(?, 'unixepoch'),
            last_created_at = datetime(?, 'unixepoch'),
            last_created_at_unix = ?
        WHERE id = ?`,
        [
            nextOccurrence ? dateToUNIX(nextOccurrence) : null,
            nextOccurrence ? dateToUNIX(nextOccurrence) : null,
            lastCreatedUnix,
            lastCreatedUnix,
            recurring.id,
        ],
    );
}
