import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import { Account } from '@/components/Accounts/schema';
import { CurrencyCode } from '@/components/Settings/molecules/ExchangeRateItem';
import {
    CreateRecurringTransaction,
    CreateTransaction,
    EditTransaction,
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
import { startOfDay } from 'date-fns';
import { occurrencesBetween } from '../utils/rrule';

export class TransactionSQLiteService extends BaseSQLiteService<Transaction> {
    constructor(db: SQLiteDatabase) {
        super('transactions', db);
    }

    async create(
        data: CreateTransaction,
        options?: { useTransaction?: boolean },
    ): Promise<GenericAPIResponse<Transaction>> {
        let transaction!: Transaction;
        let debitAccount: Account | null;
        let creditAccount: Account | null;
        const now = new Date().toISOString();
        const errorMessage = "Couldn't create transaction";

        const execute = async () => {
            const settingsService = SettingsServiceFactory.create(this.db);
            const allowOverdraw = await settingsService.get('allowOverdraw');

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

                // Check for overdraw on transfer (debit side)
                if (allowOverdraw === false) {
                    const debitAmount = data.amount + data.charges;
                    if (
                        typeof debitAccount.balance === 'number' &&
                        debitAccount.balance < debitAmount
                    ) {
                        throw new HTTPError(
                            'Insufficient funds in source account for transfer',
                            400,
                        );
                    }
                }

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
                // For debit, check for overdraw
                if (data.type === 'debit' && allowOverdraw === false) {
                    const account = await this.db.getFirstAsync<Account>(
                        'SELECT * FROM accounts WHERE id = ?',
                        [data.account_id],
                    );
                    if (!account) throw new HTTPError('Account not found', 404);
                    const debitAmount = data.amount + (data.charges ?? 0);
                    if (typeof account.balance === 'number' && account.balance < debitAmount) {
                        throw new HTTPError(
                            'Insufficient funds in account for debit transaction',
                            400,
                        );
                    }
                }

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
        };

        if (options?.useTransaction === false) {
            await execute();
        } else {
            await this.db.withTransactionAsync(async () => {
                await execute();
            });
        }

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

    async update(id: string, data: EditTransaction): Promise<GenericAPIResponse<Transaction>> {
        let updatedTransaction!: Transaction;
        const now = new Date().toISOString();
        const errorMessage = "Couldn't update transaction";
        const settingsService = SettingsServiceFactory.create(this.db);
        const allowOverdraw = await settingsService.get('allowOverdraw');

        await this.db.withTransactionAsync(async () => {
            const original = await this.db.getFirstAsync<Transaction>(
                'SELECT * FROM transactions WHERE id = ?',
                [id],
            );
            if (!original) throw new HTTPError('Transaction not found', 404);

            // check for overdraft if updating to a debit
            if (data.type === 'debit') {
                const account = await this.db.getFirstAsync<{ balance: number }>(
                    'SELECT * FROM accounts WHERE id = ?',
                    [data.account_id],
                );
                if (!account) throw new HTTPError('Account not found', 404);
                if (allowOverdraw === false && Number(data.amount) > Number(account.balance)) {
                    throw new HTTPError('Insufficient balance in account.', 400);
                }
            }

            // Update the transaction
            await this.db.runAsync(
                `UPDATE transactions SET
                    updated_at = ?, account_id = ?, type = ?, amount = ?, note = ?,
                    category = ?, created_at = ?
                WHERE id = ?`,
                [
                    now,
                    data.account_id,
                    data.type,
                    data.amount,
                    data.note ?? null,
                    data.category,
                    data.date,
                    id,
                ],
            );

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
        const dtStart = startOfDay(new Date(data.start_date));
        const rule = rrulestr(safeRule, { dtstart: dtStart });

        const firstOccurrence = rule.after(dtStart, true);
        if (!firstOccurrence)
            throw new HTTPError("Couldn't compute next occurrence from recurrence rule", 400);

        const fromAccount = data.type === 'transfer' ? data.from_account ?? null : null;
        const toAccount = data.type === 'transfer' ? data.to_account ?? null : null;

        let createdRecurring!: RecurringTransaction;

        await this.db.withTransactionAsync(async () => {
            // add recurring definition
            await this.db.runAsync(
                `INSERT INTO recurring_transactions (
                    id, created_at, updated_at, account_id, type, amount, category,
                    recurrence_rule, start_date, end_date, status, metadata,
                    created_at_unix, updated_at_unix, start_date_unix, end_date_unix,
                    create_next_at, create_next_at_unix, from_account, to_account
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?, ?
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
                    dateToUNIX(dtStart),
                    data.end_date ? dateToUNIX(new Date(data.end_date)) : null,
                    firstOccurrence.toISOString(),
                    dateToUNIX(firstOccurrence),
                    fromAccount,
                    toAccount,
                ],
            );

            const account = await this.db.getFirstAsync<{ currency: string }>(
                'SELECT currency FROM accounts WHERE id = ?',
                [data.account_id],
            );
            if (!account) throw new HTTPError('Account not found for recurring transaction', 404);

            const missedOccurrences = occurrencesBetween(
                data.recurrence_rule,
                dtStart,
                dtStart,
                now,
            );

            // create transactions for each missed occurrence
            const txService = new TransactionSQLiteService(this.db);
            let lastSuccessful: Date | null = null;
            for (const occurrenceDate of missedOccurrences) {
                try {
                    const base = {
                        account_id: data.account_id,
                        type: data.type,
                        amount: data.amount,
                        category: data.category,
                        currency: account.currency,
                        date: occurrenceDate.toISOString(),
                        charges: 0,
                    } as const;

                    if (data.type === 'transfer') {
                        await txService.create(
                            {
                                ...base,
                                note: `Recurring transfer for ${data.category}`,
                                from_account: data.from_account ?? null,
                                to_account: data.to_account ?? null,
                            } as any,
                            { useTransaction: false },
                        );
                    } else {
                        await txService.create(
                            {
                                ...base,
                                note: `Recurring transaction for ${data.category}`,
                            } as any,
                            { useTransaction: false },
                        );
                    }
                    lastSuccessful = occurrenceDate;
                } catch (err) {
                    console.error('Failed to create missed occurrence', occurrenceDate, err);
                }
            }

            if (lastSuccessful) {
                const nextAfterLast = rule.after(lastSuccessful, false);
                await this.db.runAsync(
                    `UPDATE recurring_transactions
                     SET create_next_at_unix = ?,
                         create_next_at = datetime(?, 'unixepoch'),
                         last_created_at = datetime(?, 'unixepoch'),
                         last_created_at_unix = ?
                     WHERE id = ?`,
                    [
                        nextAfterLast ? dateToUNIX(nextAfterLast) : null,
                        nextAfterLast ? dateToUNIX(nextAfterLast) : null,
                        dateToUNIX(lastSuccessful),
                        dateToUNIX(lastSuccessful),
                        uuid,
                    ],
                );
            }

            const result = await this.db.getFirstAsync<RecurringTransaction>(
                'SELECT * FROM recurring_transactions WHERE id = ?',
                [uuid],
            );
            if (!result) throw new HTTPError("Couldn't create recurring transaction", 500);
            createdRecurring = result;
        });

        return this.formatResponse({
            data: createdRecurring,
            status: 201,
            page: 1,
            page_size: 1,
            total: 1,
            total_items: 1,
            message: 'Created recurring transaction',
        });
    }

    async updateRecurringTransaction(
        id: string,
        data: Partial<CreateRecurringTransaction> & {
            is_active?: boolean;
            status?: 'active' | 'paused' | 'cancelled';
        },
    ): Promise<GenericAPIResponse<RecurringTransaction>> {
        const now = new Date().toISOString();
        let updatedRecurring!: RecurringTransaction;

        // First check if the recurring transaction exists
        const existing = await this.db.getFirstAsync<RecurringTransaction>(
            'SELECT * FROM recurring_transactions WHERE id = ?',
            [id],
        );
        if (!existing) {
            throw new HTTPError('Recurring transaction not found', 404);
        }

        await this.db.withTransactionAsync(async () => {
            const updateFields: string[] = [];
            const updateValues: any[] = [];

            // Handle basic fields
            if (data.amount !== undefined) {
                updateFields.push('amount = ?');
                updateValues.push(data.amount);
            }
            if (data.category !== undefined) {
                updateFields.push('category = ?');
                updateValues.push(data.category);
            }
            if (data.type !== undefined) {
                updateFields.push('type = ?');
                updateValues.push(data.type);
            }
            if (data.account_id !== undefined) {
                updateFields.push('account_id = ?');
                updateValues.push(data.account_id);
            }
            if (data.from_account !== undefined) {
                updateFields.push('from_account = ?');
                updateValues.push(data.from_account);
            }
            if (data.to_account !== undefined) {
                updateFields.push('to_account = ?');
                updateValues.push(data.to_account);
            }
            if (data.currency !== undefined) {
                updateFields.push('currency = ?');
                updateValues.push(data.currency);
            }
            if (data.status !== undefined) {
                updateFields.push('status = ?');
                updateValues.push(data.status);
                // Update is_active based on status
                updateFields.push('is_active = ?');
                updateValues.push(data.status === 'active' ? 1 : 0);
            } else if (data.is_active !== undefined) {
                updateFields.push('is_active = ?');
                updateValues.push(data.is_active ? 1 : 0);
                // Update status based on is_active
                updateFields.push('status = ?');
                updateValues.push(data.is_active ? 'active' : 'paused');
            }

            // Handle recurrence rule and dates if provided
            if (data.recurrence_rule !== undefined) {
                const safeRule = data.recurrence_rule.replace(
                    /\b(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\b/g,
                    (match) => WEEKDAY_MAP[match],
                );
                updateFields.push('recurrence_rule = ?');
                updateValues.push(safeRule);

                // Recalculate next occurrence if rule changed
                const startDate = data.start_date
                    ? new Date(data.start_date)
                    : new Date(existing.start_date);
                const dtStart = startOfDay(startDate);
                const rule = rrulestr(safeRule, { dtstart: dtStart });
                const nextOccurrence = rule.after(new Date(), true);

                updateFields.push('create_next_at_unix = ?');
                updateFields.push('create_next_at = datetime(?, "unixepoch")');
                updateValues.push(nextOccurrence ? dateToUNIX(nextOccurrence) : null);
                updateValues.push(nextOccurrence ? dateToUNIX(nextOccurrence) : null);
            }

            if (data.start_date !== undefined) {
                updateFields.push('start_date = ?');
                updateFields.push('start_date_unix = ?');
                updateValues.push(data.start_date);
                updateValues.push(dateToUNIX(new Date(data.start_date)));
            }

            if (data.end_date !== undefined) {
                updateFields.push('end_date = ?');
                updateFields.push('end_date_unix = ?');
                updateValues.push(data.end_date);
                updateValues.push(data.end_date ? dateToUNIX(new Date(data.end_date)) : null);
            }

            if (data.metadata !== undefined) {
                updateFields.push('metadata = ?');
                updateValues.push(JSON.stringify(data.metadata));
            }

            // Always update the updated_at timestamp
            updateFields.push('updated_at = ?');
            updateValues.push(now);

            if (updateFields.length === 0) {
                throw new HTTPError('No fields to update', 400);
            }

            // Add the ID for the WHERE clause
            updateValues.push(id);

            await this.db.runAsync(
                `UPDATE recurring_transactions 
                 SET ${updateFields.join(', ')} 
                 WHERE id = ?`,
                updateValues,
            );

            const result = await this.db.getFirstAsync<RecurringTransaction>(
                'SELECT * FROM recurring_transactions WHERE id = ?',
                [id],
            );
            if (!result) {
                throw new HTTPError("Couldn't update recurring transaction", 500);
            }
            updatedRecurring = result;
        });

        return this.formatResponse({
            data: updatedRecurring,
            status: 200,
            page: 1,
            page_size: 1,
            total: 1,
            total_items: 1,
            message: 'Updated recurring transaction',
        });
    }

    async list(query: RequestParamQuery): Promise<GenericAPIResponse<Transaction[]>> {
        const {
            page = 1,
            page_size = 10,
            accountID = false,
            start_date = false,
            end_date = false,
            accountGroup = false,
            type = false,
            sortOrder = 'desc',
        } = query;
        const offset = (page - 1) * page_size;
        const params: any[] = [];
        const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        let paginationClause = '';
        let whereClause = 't.deleted_at IS NULL';
        if (accountID) {
            whereClause += ' AND t.account_id = ?';
            params.push(accountID);
        }
        if (accountGroup) {
            whereClause += ' AND t.account_id IN (SELECT id FROM accounts WHERE category = ?)';
            params.push(accountGroup);
        }
        if (start_date && end_date) {
            whereClause += ` AND strftime('%s', t.created_at) BETWEEN strftime('%s', ?) AND strftime('%s', ?)`;
            params.push(start_date, end_date);
        }
        if (type) {
            whereClause += ' AND type = ?';
            params.push(type);
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
                account_category: string;
                account_subcategory: string | null;
            }
        >(
            `SELECT t.*,
                a.id AS account_id,
                a.name AS account_name,
                a.currency AS account_currency,
                a.category as account_category,
                a.subcategory as account_subcategory
            FROM transactions t
            INNER JOIN accounts a ON t.account_id = a.id
            WHERE ${whereClause}
            ORDER BY t.created_at ${orderDirection}
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
                    category: transaction.account_category,
                    subcategory: transaction.account_subcategory,
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

    async delete(id: string): Promise<GenericAPIResponse<null>> {
        await this.db.runAsync(`DELETE from transactions where id = ?`, [id]);
        return this.formatResponse({
            data: null,
            status: 200,
            page: 1,
            page_size: 1,
            total: 1,
            total_items: 1,
            message: 'Deleted transaction',
        });
    }

    async deleteRecurring(id: string): Promise<GenericAPIResponse<null>> {
        await this.db.runAsync(`DELETE from recurring_transactions where id = ?`, [id]);
        return this.formatResponse({
            data: null,
            status: 200,
            page: 1,
            page_size: 1,
            total: 1,
            total_items: 1,
            message: 'Deleted transaction',
        });
    }

    async listRecurringTransactions(
        query: RequestParamQuery,
    ): Promise<GenericAPIResponse<RecurringTransaction[]>> {
        const {
            page = 1,
            page_size = 10,
            accountID = false,
            start_date = false,
            end_date = false,
            status = false,
        } = query;
        const offset = (page - 1) * page_size;
        const params: any[] = [];

        let paginationClause = '';
        let whereClause = '1=1';
        if (accountID) {
            whereClause += ' AND rt.account_id = ?';
            params.push(accountID);
        }
        if (start_date && end_date) {
            whereClause += ` AND strftime('%s', rt.start_date) BETWEEN strftime('%s', ?) AND strftime('%s', ?)`;
            params.push(start_date, end_date);
        }
        if (status) {
            whereClause += ' AND rt.status = ?';
            params.push(status);
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
            `SELECT rt.* FROM recurring_transactions rt
             WHERE ${whereClause}
             ORDER BY rt.start_date DESC
             ${paginationClause}`,
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
