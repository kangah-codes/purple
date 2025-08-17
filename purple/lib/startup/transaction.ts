import { SQLiteDatabase } from 'expo-sqlite';
import { RRule } from 'rrule';
import { UUID } from '../utils/helpers';
import { dateToUNIX } from '../utils/date';
import { TransactionSQLiteService } from '../services/TransactionSQLiteService';

export async function processMissedRecurringTransactions(db: SQLiteDatabase) {
    const now = new Date();
    const nowUnix = dateToUNIX(now);

    // 1. Fetch all active recurring transactions due (with account currency joined)
    const recurringTxs = await db.getAllAsync<any>(
        `SELECT rt.*, a.currency AS account_currency
         FROM recurring_transactions rt
         JOIN accounts a ON a.id = rt.account_id
         WHERE rt.status = 'active'
           AND rt.create_next_at_unix IS NOT NULL
           AND rt.create_next_at_unix <= ?`,
        [nowUnix],
    );

    for (const recurring of recurringTxs) {
        let nextAt = recurring.create_next_at_unix;
        const rruleString = recurring.recurrence_rule;

        // Parse recurrence rule starting from last "next_at"
        const rule = RRule.fromString(rruleString);
        const after = new Date(nextAt * 1000);
        const occurrences = rule.between(after, now, true);

        if (occurrences.length === 0) continue;

        const transactionService = new TransactionSQLiteService(db);

        for (const occurrence of occurrences) {
            await transactionService.create({
                account_id: recurring.account_id,
                type: recurring.type,
                amount: recurring.amount,
                category: recurring.category,
                note: recurring.note ?? '',
                currency: recurring.account_currency, // always from account
                plan_id: recurring.plan_id ?? null,
                date: occurrence.toISOString(),
                from_account: recurring.from_account ?? null,
                to_account: recurring.to_account ?? null,
                charges: 0,
            });
        }

        const lastOccurrence = occurrences[occurrences.length - 1];
        const lastCreatedAtUnix = dateToUNIX(lastOccurrence);
        const nextOccurrence = rule.after(now, true);

        // 4. Update the recurring transaction's scheduling fields
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
                lastCreatedAtUnix,
                lastCreatedAtUnix,
                recurring.id,
            ],
        );
    }
}
