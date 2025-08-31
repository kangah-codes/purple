import { RRule } from 'rrule';
import { dateToUNIX } from '../utils/date';
import { SQLiteDatabase } from 'expo-sqlite';
import { RecurringTransaction } from '@/components/Transactions/schema';
import { TransactionSQLiteService } from '../services/TransactionSQLiteService';

export async function processRecurringTransactions(db: SQLiteDatabase) {
    const now = new Date();
    const nowUnix = dateToUNIX(now);

    // fetch all active recurring transactions due
    const recurringTxs: Array<RecurringTransaction & { account_currency: string }> =
        await db.getAllAsync<any>(
            `SELECT rt.*, a.currency AS account_currency FROM recurring_transactions rt
            JOIN accounts a ON a.id = rt.account_id
            WHERE rt.status = 'active'
            AND rt.create_next_at_unix IS NOT NULL
            AND CAST(rt.create_next_at_unix AS INTEGER) <= ?`,
            [nowUnix],
        );

    for (const recurring of recurringTxs) {
        const rruleString = recurring.recurrence_rule;
        const rule = RRule.fromString(rruleString);
        const nextExpected = new Date(recurring.create_next_at_unix * 1000);

        // check if the next expected occurrence is now or in the past
        if (nextExpected <= now) {
            const transactionService = new TransactionSQLiteService(db);

            if (recurring.type === 'transfer') {
                // Handle recurring transfer transactions
                await transactionService.create({
                    account_id: recurring.account_id,
                    type: 'transfer',
                    amount: recurring.amount,
                    category: recurring.category,
                    note: `Recurring transfer for ${recurring.category}`,
                    currency: recurring.account_currency,
                    date: nextExpected.toISOString(),
                    charges: 0,
                    from_account: recurring.from_account,
                    to_account: recurring.to_account,
                });
            } else {
                // Handle regular debit/credit recurring transactions
                await transactionService.create({
                    account_id: recurring.account_id,
                    type: recurring.type,
                    amount: recurring.amount,
                    category: recurring.category,
                    note: `Recurring transaction for ${recurring.category}`,
                    currency: recurring.account_currency,
                    date: nextExpected.toISOString(),
                    charges: 0,
                });
            }

            // calc the next occurrence after this one
            const nextOccurrence = rule.after(nextExpected, false);
            // update the recurring transaction
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
                    dateToUNIX(nextExpected),
                    dateToUNIX(nextExpected),
                    recurring.id,
                ],
            );
        } else {
            console.log(
                'Recurring transaction not due yet:',
                recurring.id,
                'Next at:',
                nextExpected,
            );
        }
    }
}
