import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import { Account } from '@/components/Accounts/schema';
import { isLiabilityAccount } from '@/components/Accounts/utils';
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
import { format, startOfDay } from 'date-fns';
import { occurrencesBetween } from '../utils/rrule';

export class TransactionSQLiteService extends BaseSQLiteService<Transaction> {
    constructor(db: SQLiteDatabase) {
        super('transactions', db);
    }
    private budgetTriggerCheck: {
        checked: boolean;
        hasUpdateTrigger: boolean;
        hasDeleteTrigger: boolean;
    } = {
        checked: false,
        hasUpdateTrigger: false,
        hasDeleteTrigger: false,
    };

    private async ensureBudgetTriggerInfo(): Promise<void> {
        if (this.budgetTriggerCheck.checked) return;

        try {
            const update = await this.db.getFirstAsync<{ name: string }>(
                `SELECT name FROM sqlite_master WHERE type = 'trigger' AND name = ? LIMIT 1`,
                ['trg_after_update_transaction_budget'],
            );
            const del = await this.db.getFirstAsync<{ name: string }>(
                `SELECT name FROM sqlite_master WHERE type = 'trigger' AND name = ? LIMIT 1`,
                ['trg_before_delete_transaction_budget'],
            );

            this.budgetTriggerCheck = {
                checked: true,
                hasUpdateTrigger: Boolean(update?.name),
                hasDeleteTrigger: Boolean(del?.name),
            };
        } catch {
            // If sqlite_master is unavailable for any reason, assume no triggers and fall back.
            this.budgetTriggerCheck = {
                checked: true,
                hasUpdateTrigger: false,
                hasDeleteTrigger: false,
            };
        }
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

                // Check for overdraw on transfer (debit side) - skip for liability accounts
                const isDebitLiability = isLiabilityAccount(debitAccount.category);
                const isCreditLiability = isLiabilityAccount(creditAccount.category);

                if (allowOverdraw === false && !isDebitLiability) {
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

                // Create debit entry only if source account is not a liability account
                // For liability accounts, we don't want to reduce the debt when spending from it
                let debitUUID: string;
                if (!isDebitLiability) {
                    debitUUID = UUID();
                    await this.db.runAsync(
                        `INSERT INTO transactions
                      (id, created_at, updated_at, account_id, user_id, type,
                       amount, note, category, from_account, to_account, currency, plan_id, budget_id)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                            data.budget_id ?? null,
                        ],
                    );
                } else {
                    // For liability accounts, just create a placeholder UUID for return
                    debitUUID = UUID();
                }

                // Create credit entry
                // For liability accounts, use debit to reduce the debt when receiving payment
                const creditUUID = UUID();
                const creditTransactionType = isCreditLiability ? 'debit' : 'credit';

                await this.db.runAsync(
                    `INSERT INTO transactions
                  (id, created_at, updated_at, account_id, user_id, type,
                   amount, note, category, from_account, to_account, currency, plan_id, budget_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        creditUUID,
                        data.date,
                        now,
                        data.to_account ?? null,
                        null,
                        creditTransactionType,
                        creditAmount,
                        isNotEmptyString(data.note) ? data.note! : defaultNote,
                        data.category,
                        data.from_account ?? null,
                        data.to_account ?? null,
                        creditAccount.currency,
                        data.plan_id ?? null,
                        data.budget_id ?? null,
                    ],
                );

                const result = await this.db.getFirstAsync<Transaction>(
                    'SELECT * FROM transactions WHERE id = ?',
                    [isDebitLiability ? creditUUID : debitUUID],
                );
                if (!result) throw new HTTPError(errorMessage, 500);
                transaction = result;
            } else {
                // Get the account to check currency and balance
                const account = await this.db.getFirstAsync<Account>(
                    'SELECT * FROM accounts WHERE id = ?',
                    [data.account_id],
                );
                if (!account) throw new HTTPError('Account not found', 404);

                // Convert amount if transaction currency differs from account currency
                let transactionAmount = data.amount;
                const shouldUseConversion = await settingsService.get('allowCurrencyConversion');
                if (
                    data.currency &&
                    account.currency &&
                    data.currency.toLowerCase() !== account.currency.toLowerCase() &&
                    shouldUseConversion === true
                ) {
                    const currencyService = CurrencyService.getInstance();
                    transactionAmount = await currencyService.convertCurrencyAsync({
                        from: {
                            currency: data.currency.toLowerCase() as CurrencyCode,
                            amount: data.amount,
                        },
                        to: {
                            currency: account.currency.toLowerCase() as CurrencyCode,
                        },
                    });
                }

                // For debit, check for overdraw
                if (data.type === 'debit' && allowOverdraw === false) {
                    const debitAmount = transactionAmount + (data.charges ?? 0);
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
                   amount, note, category, from_account, to_account, currency, plan_id, budget_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        uuid,
                        data.date,
                        now,
                        data.account_id,
                        null,
                        data.type,
                        transactionAmount,
                        data.note ?? null,
                        data.category,
                        data.from_account ?? null,
                        data.to_account ?? null,
                        account.currency, // Use account's currency since amount was converted
                        data.plan_id ?? null,
                        data.budget_id ?? null,
                    ],
                );

                // Update budget summary if budget_id is provided and transaction is a debit (expense).
                // Important: do NOT count transfers toward budgets. Some legacy data can represent
                // transfers as debits with from_account/to_account populated, so explicitly exclude them.
                if (
                    data.budget_id &&
                    data.type === 'debit' &&
                    !data.from_account &&
                    !data.to_account
                ) {
                    await this.applyBudgetSpendDelta(data.budget_id, transactionAmount, data.category);
                }

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

    /**
     * Updates budget summary and category limits when a transaction is created.
     * Increments the total_spent in budget_summaries and spent_amount in budget_category_limits.
     */
    private async applyBudgetSpendDelta(
        budgetId: string,
        amountDelta: number,
        category: string,
    ): Promise<void> {
        try {
            const now = new Date().toISOString();

            // Update the budget summary total_spent
            await this.db.runAsync(
                `UPDATE budget_summaries 
                SET total_spent = total_spent + ?, updated_at = ?
                WHERE budget_id = ?`,
                [amountDelta, now, budgetId],
            );

            // Update the category limit spent_amount if it exists
            await this.db.runAsync(
                `UPDATE budget_category_limits 
                SET spent_amount = spent_amount + ?, updated_at = ?
                WHERE budget_id = ? AND category = ? AND deleted_at IS NULL`,
                [amountDelta, now, budgetId, category],
            );

            // Update flex allocations spent_amount if it exists
            await this.db.runAsync(
                `UPDATE budget_allocations 
                SET spent_amount = spent_amount + ?, updated_at = ?
                WHERE budget_id = ? AND category = ? AND deleted_at IS NULL`,
                [amountDelta, now, budgetId, category],
            );
        } catch (error) {
            console.error('Error updating budget spend:', error);
        }
    }

    private async recomputeBudgetSpend(budgetId: string): Promise<void> {
        try {
            const now = new Date().toISOString();

            await this.db.runAsync(
                `UPDATE budget_summaries
                 SET total_spent = (
                    SELECT COALESCE(SUM(amount), 0)
                    FROM transactions
                    WHERE budget_id = ?
                      AND type = 'debit'
                                            AND (from_account IS NULL OR from_account = '')
                                            AND (to_account IS NULL OR to_account = '')
                      AND deleted_at IS NULL
                 ), updated_at = ?
                 WHERE budget_id = ?`,
                [budgetId, now, budgetId],
            );

            await this.db.runAsync(
                `UPDATE budget_category_limits
                 SET spent_amount = (
                    SELECT COALESCE(SUM(amount), 0)
                    FROM transactions
                    WHERE budget_id = ?
                      AND type = 'debit'
                                            AND (from_account IS NULL OR from_account = '')
                                            AND (to_account IS NULL OR to_account = '')
                      AND category = budget_category_limits.category
                      AND deleted_at IS NULL
                 ), updated_at = ?
                 WHERE budget_id = ?
                   AND deleted_at IS NULL`,
                [budgetId, now, budgetId],
            );

            await this.db.runAsync(
                `UPDATE budget_allocations
                 SET spent_amount = (
                    SELECT COALESCE(SUM(amount), 0)
                    FROM transactions
                    WHERE budget_id = ?
                      AND type = 'debit'
                      AND (from_account IS NULL OR from_account = '')
                      AND (to_account IS NULL OR to_account = '')
                      AND category = budget_allocations.category
                      AND deleted_at IS NULL
                 ), updated_at = ?
                 WHERE budget_id = ?
                   AND deleted_at IS NULL`,
                [budgetId, now, budgetId],
            );
        } catch (error) {
            console.error('Error recomputing budget spend:', error);
        }
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

            await this.ensureBudgetTriggerInfo();

            const nextBudgetId = data.budget_id === undefined ? original.budget_id : data.budget_id;
            const nextType = data.type ?? original.type;
            const nextAmount = data.amount ?? original.amount;

            // Overdraw validation for edits should be based on the *net change*.
            // The account balance already reflects the original transaction.
            if (allowOverdraw === false) {
                const effectOnBalance = (type: Transaction['type'], amount: number): number => {
                    if (type === 'debit') return -Number(amount);
                    if (type === 'credit') return Number(amount);
                    return 0;
                };

                const originalAccountId = original.account_id;
                const nextAccountId = data.account_id;

                const originalAccount = await this.db.getFirstAsync<Account>(
                    'SELECT * FROM accounts WHERE id = ?',
                    [originalAccountId],
                );
                if (!originalAccount) throw new HTTPError('Account not found', 404);

                const nextAccount =
                    nextAccountId === originalAccountId
                        ? originalAccount
                        : await this.db.getFirstAsync<Account>(
                              'SELECT * FROM accounts WHERE id = ?',
                              [nextAccountId],
                          );
                if (!nextAccount) throw new HTTPError('Account not found', 404);

                const originalEffect = effectOnBalance(original.type, original.amount);
                const nextEffect = effectOnBalance(nextType, nextAmount);

                // Mirror what the `trg_after_update_transaction` trigger does:
                // reverse OLD on OLD.account_id, then apply NEW on NEW.account_id.
                if (originalAccountId === nextAccountId) {
                    const projected =
                        Number(originalAccount.balance ?? 0) + (nextEffect - originalEffect);
                    if (projected < 0) {
                        throw new HTTPError('Insufficient balance in account.', 400);
                    }
                } else {
                    const projectedOriginal = Number(originalAccount.balance ?? 0) - originalEffect;
                    const projectedNext = Number(nextAccount.balance ?? 0) + nextEffect;

                    if (projectedOriginal < 0 || projectedNext < 0) {
                        throw new HTTPError('Insufficient balance in account.', 400);
                    }
                }
            }

            // Update the transaction
            await this.db.runAsync(
                `UPDATE transactions SET
                    updated_at = ?, account_id = ?, type = ?, amount = ?, note = ?,
                    category = ?, created_at = ?, budget_id = ?
                WHERE id = ?`,
                [
                    now,
                    data.account_id,
                    data.type,
                    data.amount,
                    data.note ?? null,
                    data.category,
                    data.date,
                    nextBudgetId ?? null,
                    id,
                ],
            );

            // Fallback: if triggers aren't installed (older DBs), manually adjust budget spend.
            // This keeps "Count in budget" edits consistent without double-counting.
            if (!this.budgetTriggerCheck.hasUpdateTrigger) {
                const affected = new Set<string>();
                if (original.budget_id) affected.add(original.budget_id);
                if (nextBudgetId) affected.add(nextBudgetId);
                for (const bId of affected) {
                    await this.recomputeBudgetSpend(bId);
                }
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
        const dtStart = startOfDay(new Date(data.start_date));
        const rule = rrulestr(safeRule, { dtstart: dtStart });

        const firstOccurrence = rule.after(dtStart, true);
        if (!firstOccurrence)
            throw new HTTPError("Couldn't compute next occurrence from recurrence rule", 400);

        const fromAccount = data.type === 'transfer' ? data.from_account ?? null : null;
        const toAccount = data.type === 'transfer' ? data.to_account ?? null : null;

        let createdRecurring!: RecurringTransaction;

        await this.db.withTransactionAsync(async () => {
            const shouldCountInBudget = Boolean((data.metadata as any)?.count_in_budget);

            // Get the account to check currency
            const account = await this.db.getFirstAsync<{ currency: string }>(
                'SELECT currency FROM accounts WHERE id = ?',
                [data.account_id],
            );
            if (!account) throw new HTTPError('Account not found for recurring transaction', 404);

            // Store the original currency in metadata so we can convert at each occurrence
            // This ensures we use the latest exchange rates for each transaction
            const metadataWithCurrency = {
                ...(data.metadata ?? {}),
                original_currency: data.currency, // Store original currency for future conversions
                original_amount: data.amount, // Store original amount for reference
            };

            const getBudgetIdForOccurrence = async (occurrenceDate: Date) => {
                if (!shouldCountInBudget || data.type !== 'debit') return null;

                const monthName = format(occurrenceDate, 'MMMM');
                const year = occurrenceDate.getFullYear();
                const row = await this.db.getFirstAsync<{ id: string }>(
                    `SELECT id FROM budgets
                     WHERE month = ? AND year = ? AND deleted_at IS NULL
                     LIMIT 1`,
                    [monthName, year],
                );
                return row?.id ?? null;
            };

            // add recurring definition - store original amount and currency in metadata
            // Conversion will happen at each occurrence using latest exchange rates
            await this.db.runAsync(
                `INSERT INTO recurring_transactions (
                    id, created_at, updated_at, account_id, type, amount, category,
                    recurrence_rule, start_date, end_date, status, metadata,
                    created_at_unix, updated_at_unix, start_date_unix, end_date_unix,
                    create_next_at, create_next_at_unix, from_account, to_account, notes
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?, ?, ?
                )`,
                [
                    uuid,
                    now.toISOString(),
                    now.toISOString(),
                    data.account_id,
                    data.type,
                    data.amount, // Store original amount - conversion happens at each occurrence
                    data.category,
                    data.recurrence_rule,
                    data.start_date,
                    data.end_date ?? null,
                    'active',
                    JSON.stringify(metadataWithCurrency), // Include original currency info
                    nowUNIX,
                    nowUNIX,
                    dateToUNIX(dtStart),
                    data.end_date ? dateToUNIX(new Date(data.end_date)) : null,
                    firstOccurrence.toISOString(),
                    dateToUNIX(firstOccurrence),
                    fromAccount,
                    toAccount,
                    data.notes ?? null,
                ],
            );

            const missedOccurrences = occurrencesBetween(
                data.recurrence_rule,
                dtStart,
                dtStart,
                now,
            );

            // create transactions for each missed occurrence
            // Pass original currency so conversion happens with current rates
            const txService = new TransactionSQLiteService(this.db);
            let lastSuccessful: Date | null = null;
            for (const occurrenceDate of missedOccurrences) {
                try {
                    const budgetId = await getBudgetIdForOccurrence(occurrenceDate);
                    const base = {
                        account_id: data.account_id,
                        type: data.type,
                        amount: data.amount, // Original amount - will be converted in create()
                        category: data.category,
                        currency: data.currency, // Original currency - triggers conversion in create()
                        date: occurrenceDate.toISOString(),
                        charges: 0,
                        budget_id: budgetId ?? undefined,
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

            // TODO: refactor the fuck outta this
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
            if (data.notes !== undefined) {
                updateFields.push('notes = ?');
                updateValues.push(data.notes);
            }
            if (data.currency !== undefined) {
                updateFields.push('currency = ?');
                updateValues.push(data.currency);
            }
            if (data.status !== undefined) {
                updateFields.push('status = ?');
                updateValues.push(data.status);
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
            search_value = false,
            // New filter parameters
            account_ids = false,
            category = false,
            min_amount = false,
            max_amount = false,
        } = query;
        const params: any[] = [];
        const searchParams: any[] = [];
        const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        let paginationClause = '';
        let whereClause = 't.deleted_at IS NULL';
        let searchClause = '';

        // Legacy accountID support (single account)
        if (accountID) {
            whereClause += ' AND t.account_id = ?';
            params.push(accountID);
            searchParams.push(accountID);
        }

        // New account_ids filter support (multiple accounts)
        if (account_ids && Array.isArray(account_ids) && account_ids.length > 0) {
            const placeholders = account_ids.map(() => '?').join(',');
            whereClause += ` AND t.account_id IN (${placeholders})`;
            params.push(...account_ids);
            searchParams.push(...account_ids);
        }

        if (accountGroup) {
            whereClause += ' AND t.account_id IN (SELECT id FROM accounts WHERE category = ?)';
            params.push(accountGroup);
            searchParams.push(accountGroup);
        }

        if (start_date && end_date) {
            // Use direct string comparison instead of strftime to allow index usage
            whereClause += ` AND t.created_at BETWEEN ? AND ?`;
            params.push(start_date, end_date);
            searchParams.push(start_date, end_date);
        }

        if (search_value) {
            searchClause = ' AND (t.note LIKE ? OR t.category LIKE ? OR a.name LIKE ?)';
            const likeTerm = `%${search_value}%`;
            params.push(likeTerm, likeTerm, likeTerm);
            searchParams.push(likeTerm, likeTerm, likeTerm);
        }

        if (type && !Array.isArray(type)) {
            whereClause += ' AND t.type = ?';
            params.push(type);
            searchParams.push(type);
        }

        if (type && Array.isArray(type) && type.length > 0) {
            const placeholders = type.map(() => '?').join(',');
            whereClause += ` AND t.type IN (${placeholders})`;
            params.push(...type);
            searchParams.push(...type);
        }

        if (category && Array.isArray(category) && category.length > 0) {
            const placeholders = category.map(() => '?').join(',');
            whereClause += ` AND t.category IN (${placeholders})`;
            params.push(...category);
            searchParams.push(...category);
        }

        if (min_amount && typeof min_amount === 'number') {
            whereClause += ' AND t.amount >= ?';
            params.push(min_amount);
            searchParams.push(min_amount);
        }

        if (max_amount && typeof max_amount === 'number') {
            whereClause += ' AND t.amount <= ?';
            params.push(max_amount);
            searchParams.push(max_amount);
        }

        if (Number.isFinite(page_size)) {
            const offset = (page - 1) * page_size;
            paginationClause = 'LIMIT ? OFFSET ?';
            params.push(page_size, offset);
        }

        // For count query, use JOIN if search includes account name
        const countQuery = search_value
            ? `SELECT COUNT(*) FROM transactions t INNER JOIN accounts a ON t.account_id = a.id WHERE ${whereClause}${searchClause}`
            : `SELECT COUNT(*) FROM transactions t WHERE ${whereClause}`;

        const result = await this.db.getFirstAsync<{ 'COUNT(*)': number }>(
            countQuery,
            search_value ? [...searchParams] : [...params.slice(0, -2)], // exclude pagination params
        );
        if (!result) throw new Error('Error fetching transactions');

        // Use indexed columns in WHERE clause first for better query planning
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
            WHERE ${whereClause}${searchClause}
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
        const occurrences: RecurringTransaction[] = [];
        const recurringDefs = await this.db.getAllAsync<RecurringTransaction>(
            `SELECT * FROM recurring_transactions
            WHERE start_date_unix <= ?
            AND (end_date_unix IS NULL OR end_date_unix >= ?)
            AND status = 'active'`,
            [toUnix, fromUnix],
        );

        for (const def of recurringDefs) {
            try {
                const originalStartDate = new Date(def.start_date);
                const rule = rrulestr(def.recurrence_rule, {
                    dtstart: originalStartDate,
                });

                // Get occurrences between the effective start date and end date
                const effectiveStartDate =
                    originalStartDate > from_date ? originalStartDate : from_date;
                const dates = rule.between(effectiveStartDate, to_date, true);

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
        await this.ensureBudgetTriggerInfo();

        let originalBudgetId: string | null = null;

        if (!this.budgetTriggerCheck.hasDeleteTrigger) {
            const original = await this.db.getFirstAsync<Transaction>(
                'SELECT * FROM transactions WHERE id = ?',
                [id],
            );
            originalBudgetId = original?.budget_id ?? null;
        }

        await this.db.runAsync(`DELETE from transactions where id = ?`, [id]);

        if (!this.budgetTriggerCheck.hasDeleteTrigger && originalBudgetId) {
            await this.recomputeBudgetSpend(originalBudgetId);
        }
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
            `SELECT COUNT(*) FROM recurring_transactions rt 
             INNER JOIN accounts a ON rt.account_id = a.id 
             WHERE ${whereClause}`,
            [...params],
        );
        if (!result) throw new Error('Error fetching recurring transactions');

        params.push(page_size, offset);
        const transactions = await this.db.getAllAsync<RecurringTransaction>(
            `SELECT rt.*, a.currency AS account_currency 
             FROM recurring_transactions rt
             INNER JOIN accounts a ON rt.account_id = a.id
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
