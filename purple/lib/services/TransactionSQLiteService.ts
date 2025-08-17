import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import { Account } from '@/components/Accounts/schema';
import { CurrencyCode } from '@/components/Settings/molecules/ExchangeRateItem';
import {
    CreateRecurringTransaction,
    CreateTransaction,
    RecurringTransaction,
    Transaction,
} from '@/components/Transactions/schema';
import { type SQLiteDatabase } from 'expo-sqlite';
import { rrulestr } from 'rrule';
import { SettingsServiceFactory } from '../factory/SettingsFactory';
import { dateToUNIX } from '../utils/date';
import HTTPError from '../utils/error';
import { UUID } from '../utils/helpers';
import { isNotEmptyString } from '../utils/string';
import CurrencyService from './CurrencyService';
import { BaseSQLiteService } from './SQLiteService';
import { WEEKDAY_MAP } from '@/components/Transactions/constants';

export class TransactionSQLiteService extends BaseSQLiteService<Transaction> {
    constructor(db: SQLiteDatabase) {
        super('transactions', db);
    }

    async create(data: CreateTransaction): Promise<GenericAPIResponse<Transaction>> {
        let transaction!: Transaction;
        let debitAccount: Account | null;
        let creditAccount: Account | null;
        const now = new Date().toISOString();
        const errorMessage = "Couldn't create transaction";

        await this.db.withTransactionAsync(async () => {
            const settingsService = SettingsServiceFactory.create(this.db);

            if (data.type === 'transfer') {
                debitAccount = await this.db.getFirstAsync<Account>(
                    'SELECT * FROM accounts WHERE id = ?',
                    [data.from_account!],
                );
                creditAccount = await this.db.getFirstAsync<Account>(
                    'SELECT * FROM accounts WHERE id = ?',
                    [data.to_account!],
                );

                if (!creditAccount || !debitAccount) throw new Error(errorMessage);

                const defaultNote = `Transfer from ${debitAccount.name}`;
                let creditAmount = data.amount;
                const shouldUseConversion = await settingsService.get('allowCurrencyConversion');

                if (
                    debitAccount.currency !== creditAccount.currency &&
                    shouldUseConversion === true
                ) {
                    const currencyService = CurrencyService.getInstance();
                    creditAmount = await currencyService.convertCurrencyAsync({
                        from: {
                            currency: debitAccount.currency.toLowerCase() as CurrencyCode,
                            amount: data.amount,
                        },
                        to: {
                            currency: creditAccount.currency.toLowerCase() as CurrencyCode,
                        },
                    });
                }

                // Create debit entry
                const debitUUID = UUID();
                await this.db.runAsync(
                    `INSERT INTO transactions
                  (id, created_at, updated_at, account_id, user_id, type,
                   amount, note, category, from_account, to_account, currency, plan_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        debitUUID,
                        data.date,
                        now,
                        data.from_account ?? null,
                        null,
                        'debit',
                        data.amount + data.charges,
                        isNotEmptyString(data.note) ? data.note! : defaultNote,
                        data.category,
                        data.from_account ?? null,
                        data.to_account ?? null,
                        debitAccount.currency,
                        data.plan_id ?? null,
                    ],
                );

                // Create credit entry
                const creditUUID = UUID();
                await this.db.runAsync(
                    `INSERT INTO transactions
                  (id, created_at, updated_at, account_id, user_id, type,
                   amount, note, category, from_account, to_account, currency, plan_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        creditUUID,
                        data.date,
                        now,
                        data.to_account ?? null,
                        null,
                        'credit',
                        creditAmount,
                        isNotEmptyString(data.note) ? data.note! : defaultNote,
                        data.category,
                        data.from_account ?? null,
                        data.to_account ?? null,
                        creditAccount.currency,
                        data.plan_id ?? null,
                    ],
                );

                const result = await this.db.getFirstAsync<Transaction>(
                    'SELECT * FROM transactions WHERE id = ?',
                    [debitUUID],
                );
                if (!result) throw new HTTPError(errorMessage, 500);
                transaction = result;
            } else {
                const uuid = UUID();
                await this.db.runAsync(
                    `INSERT INTO transactions
                  (id, created_at, updated_at, account_id, user_id, type,
                   amount, note, category, from_account, to_account, currency, plan_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        uuid,
                        data.date,
                        now,
                        data.account_id,
                        null,
                        data.type,
                        data.amount,
                        data.note ?? null,
                        data.category,
                        data.from_account ?? null,
                        data.to_account ?? null,
                        data.currency,
                        data.plan_id ?? null,
                    ],
                );

                const result = await this.db.getFirstAsync<Transaction>(
                    'SELECT * FROM transactions WHERE id = ?',
                    [uuid],
                );
                if (!result) throw new HTTPError(errorMessage, 500);
                transaction = result;
            }
        });

        return this.formatResponse({
            data: transaction,
            status: 201,
            page: 1,
            page_size: 1,
            total: 1,
            total_items: 1,
            message: 'Created transaction',
        });
    }

    async update(id: string, data: CreateTransaction): Promise<GenericAPIResponse<Transaction>> {
        let updatedTransaction!: Transaction;
        const now = new Date().toISOString();
        const errorMessage = "Couldn't update transaction";

        await this.db.withTransactionAsync(async () => {
            const original = await this.db.getFirstAsync<Transaction>(
                'SELECT * FROM transactions WHERE id = ?',
                [id],
            );
            if (!original) throw new HTTPError('Transaction not found', 404);

            // Reverse original transaction effects
            const reverseEffect = async () => {
                if (original.type === 'transfer') {
                    const debitAccount = await this.db.getFirstAsync<Account>(
                        'SELECT * from accounts where id = ?',
                        [original.from_account!],
                    );
                    const creditAccount = await this.db.getFirstAsync<Account>(
                        'SELECT * from accounts where id = ?',
                        [original.to_account!],
                    );
                    if (!debitAccount || !creditAccount) throw new Error(errorMessage);

                    await this.db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?', [
                        debitAccount.balance + original.amount,
                        debitAccount.id,
                    ]);
                    await this.db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?', [
                        creditAccount.balance - original.amount,
                        creditAccount.id,
                    ]);
                } else {
                    const account = await this.db.getFirstAsync<Account>(
                        'SELECT * from accounts where id = ?',
                        [original.account_id!],
                    );
                    if (!account) throw new Error(errorMessage);
                    const revertAmount =
                        original.type === 'debit'
                            ? account.balance + original.amount
                            : account.balance - original.amount;

                    await this.db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?', [
                        revertAmount,
                        original.account_id,
                    ]);
                }
            };

            await reverseEffect();

            // Update the transaction
            await this.db.runAsync(
                `UPDATE transactions SET
                    updated_at = ?, account_id = ?, type = ?, amount = ?, note = ?,
                    category = ?, from_account = ?, to_account = ?, currency = ?, plan_id = ?, created_at = ?
                WHERE id = ?`,
                [
                    now,
                    data.account_id,
                    data.type,
                    data.amount,
                    data.note ?? null,
                    data.category,
                    data.from_account ?? null,
                    data.to_account ?? null,
                    data.currency,
                    data.plan_id ?? null,
                    data.date,
                    id,
                ],
            );

            // Apply new effects
            if (data.type === 'transfer') {
                const debitAccount = await this.db.getFirstAsync<Account>(
                    'SELECT * from accounts where id = ?',
                    [data.from_account!],
                );
                const creditAccount = await this.db.getFirstAsync<Account>(
                    'SELECT * from accounts where id = ?',
                    [data.to_account!],
                );
                if (!debitAccount || !creditAccount) throw new Error(errorMessage);

                await this.db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?', [
                    debitAccount.balance - data.amount,
                    debitAccount.id,
                ]);
                await this.db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?', [
                    creditAccount.balance + data.amount,
                    creditAccount.id,
                ]);
            } else {
                const account = await this.db.getFirstAsync<Account>(
                    'SELECT * from accounts where id = ?',
                    [data.account_id!],
                );
                if (!account) throw new Error(errorMessage);
                const newBalance =
                    data.type === 'debit'
                        ? account.balance - data.amount
                        : account.balance + data.amount;

                await this.db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?', [
                    newBalance,
                    data.account_id,
                ]);
            }

            const result = await this.db.getFirstAsync<Transaction>(
                'SELECT * FROM transactions WHERE id = ?',
                [id],
            );
            if (!result) throw new HTTPError(errorMessage, 500);
            updatedTransaction = result;
        });

        return this.formatResponse({
            data: updatedTransaction,
            status: 200,
            page: 1,
            page_size: 1,
            total: 1,
            total_items: 1,
            message: 'Updated transaction',
        });
    }

    async get(id: string): Promise<GenericAPIResponse<Transaction>> {
        const transaction = await this.db.getFirstAsync<Transaction>(
            `SELECT * FROM transactions WHERE deleted_at IS NULL AND id = ?`,
            [id],
        );

        if (!transaction) throw new HTTPError('Transaction not found', 404);

        return this.formatResponse({
            data: transaction,
            status: 200,
            page: 1,
            page_size: 1,
            total: 1,
            total_items: 1,
            message: 'Success',
        });
    }

    async createRecurringTransaction(
        data: CreateRecurringTransaction,
    ): Promise<GenericAPIResponse<RecurringTransaction>> {
        const now = new Date();
        const uuid = UUID();
        const nowUNIX = dateToUNIX(now);
        const safeRule = data.recurrence_rule.replace(
            /\b(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\b/g,
            (match) => WEEKDAY_MAP[match],
        );
        const rule = rrulestr(safeRule, {
            dtstart: new Date(data.start_date),
        });

        const nextOccurrence = rule.after(now);
        if (!nextOccurrence) {
            throw new HTTPError("Couldn't compute next occurrence from recurrence rule", 400);
        }

        const createNextAt = nextOccurrence.toISOString();
        const createNextAtUnix = dateToUNIX(nextOccurrence);

        await this.db.runAsync(
            `INSERT INTO recurring_transactions (
                id, created_at, updated_at, account_id, type, amount, category, 
                recurrence_rule, start_date, end_date, status, metadata,
                created_at_unix, updated_at_unix, start_date_unix, end_date_unix,
                create_next_at, create_next_at_unix
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?
            )`,
            [
                uuid,
                now.toISOString(),
                now.toISOString(),
                data.account_id,
                data.type,
                data.amount,
                data.category,
                data.recurrence_rule,
                data.start_date,
                data.end_date ?? null,
                'active',
                JSON.stringify(data.metadata ?? {}),
                nowUNIX,
                nowUNIX,
                dateToUNIX(new Date(data.start_date)),
                data.end_date ? dateToUNIX(new Date(data.end_date)) : null,
                createNextAt,
                createNextAtUnix,
            ],
        );
        const result = await this.db.getFirstAsync<RecurringTransaction>(
            'SELECT * FROM recurring_transactions WHERE id = ?',
            [uuid],
        );

        if (!result) throw new HTTPError("Couldn't create recurring transaction", 500);

        return this.formatResponse({
            data: result,
            status: 201,
            page: 1,
            page_size: 1,
            total: 1,
            total_items: 1,
            message: 'Created recurring transaction',
        });
    }

    async list(query: RequestParamQuery): Promise<GenericAPIResponse<Transaction[]>> {
        const {
            page = 1,
            page_size = 10,
            accountID = false,
            start_date = false,
            end_date = false,
        } = query;
        const offset = (page - 1) * page_size;
        const params: any[] = [];

        let paginationClause = '';
        let whereClause = 't.deleted_at IS NULL';
        if (accountID) {
            whereClause += ' AND t.account_id = ?';
            params.push(accountID);
        }
        if (start_date && end_date) {
            whereClause += ` AND strftime('%s', t.created_at) BETWEEN strftime('%s', ?) AND strftime('%s', ?)`;
            params.push(start_date, end_date);
        }
        if (Number.isFinite(page_size)) {
            const offset = (page - 1) * page_size;
            paginationClause = 'LIMIT ? OFFSET ?';
            params.push(page_size, offset);
        }

        const result = await this.db.getFirstAsync<{ 'COUNT(*)': number }>(
            `SELECT COUNT(*) FROM transactions t WHERE ${whereClause}`,
            [...params],
        );
        if (!result) throw new Error('Error fetching transactions');

        params.push(page_size, offset);
        const transactions = await this.db.getAllAsync<
            Transaction & {
                account_id: string;
                account_currency: string;
                account_name: string;
            }
        >(
            `SELECT t.*,
                a.id AS account_id,
                a.name AS account_name,
                a.currency AS account_currency
            FROM transactions t
            INNER JOIN accounts a ON t.account_id = a.id
            WHERE ${whereClause}
            ORDER BY t.created_at DESC
            ${paginationClause}`,
            params,
        );

        return this.formatResponse({
            data: transactions.map((transaction) => ({
                ...transaction,
                currency: transaction.account_currency,
                account: {
                    id: transaction.account_id,
                    name: transaction.account_name,
                },
            })) as unknown as Transaction[],
            status: 200,
            page: Number(page),
            page_size: Number(page_size),
            total: 1,
            total_items: result['COUNT(*)'],
            message: 'Success',
        });
    }

    async listUpcomingRecurringTransactions(
        from_date: Date,
        to_date: Date,
        n: number = 10,
    ): Promise<GenericAPIResponse<RecurringTransaction[]>> {
        const fromUnix = dateToUNIX(from_date);
        const toUnix = dateToUNIX(to_date);

        const recurringDefs = await this.db.getAllAsync<RecurringTransaction>(
            `SELECT * FROM recurring_transactions
            WHERE start_date_unix <= ?
            AND (end_date_unix IS NULL OR end_date_unix >= ?)
            AND status = 'active'`,
            [toUnix, fromUnix],
        );

        const occurrences: RecurringTransaction[] = [];

        for (const def of recurringDefs) {
            try {
                const rule = rrulestr(def.recurrence_rule, {
                    dtstart: new Date(def.start_date_unix * 1000),
                });

                const dates = rule.between(from_date, to_date, true);

                for (const d of dates) {
                    const occurrenceUnix = Math.floor(d.getTime() / 1000);

                    if (occurrenceUnix >= fromUnix && occurrenceUnix <= toUnix) {
                        occurrences.push({
                            ...def,
                            start_date: d.toISOString(),
                            start_date_unix: occurrenceUnix,
                            create_next_at: d.toISOString(),
                            create_next_at_unix: occurrenceUnix,
                        });
                    }
                }
            } catch (err) {
                console.error('Invalid recurrence rule for', def.id, err);
            }
        }

        occurrences.sort((a, b) => a.create_next_at_unix - b.create_next_at_unix);

        const total_items = occurrences.length;
        const limited = occurrences.slice(0, n);

        return this.formatResponse({
            data: limited,
            status: 200,
            page: 1,
            page_size: n,
            total: Math.ceil(total_items / n),
            total_items,
            message: 'Success',
        });
    }

    async listRecurringTransactions(
        query: RequestParamQuery,
    ): Promise<GenericAPIResponse<RecurringTransaction[]>> {
        const { page = 1, page_size = 10, accountID = false } = query;
        const offset = (page - 1) * page_size;
        const params: any[] = [];

        let paginationClause = '';
        let whereClause = 'rt.deleted_at IS NULL';
        if (accountID) {
            whereClause += ' AND rt.account_id = ?';
            params.push(accountID);
        }
        if (Number.isFinite(page_size)) {
            paginationClause = 'LIMIT ? OFFSET ?';
            params.push(page_size, offset);
        }

        const result = await this.db.getFirstAsync<{ 'COUNT(*)': number }>(
            `SELECT COUNT(*) FROM recurring_transactions rt WHERE ${whereClause}`,
            [...params],
        );
        if (!result) throw new Error('Error fetching recurring transactions');

        params.push(page_size, offset);
        const transactions = await this.db.getAllAsync<RecurringTransaction>(
            `SELECT * FROM recurring_transactions rt WHERE ${whereClause} ORDER BY rt.created_at DESC ${paginationClause}`,
            params,
        );

        return this.formatResponse({
            data: transactions,
            status: 200,
            page: Number(page),
            page_size: Number(page_size),
            total: 1,
            total_items: result['COUNT(*)'],
            message: 'Success',
        });
    }
}
