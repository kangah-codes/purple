import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import { Account } from '@/components/Accounts/schema';
import { CreateTransaction, Transaction } from '@/components/Transactions/schema';
import { type SQLiteDatabase } from 'expo-sqlite';
import HTTPError from '../utils/error';
import { UUID } from '../utils/helpers';
import { BaseSQLiteService } from './SQLiteService';

export class TransactionSQLiteService extends BaseSQLiteService<Transaction> {
    constructor(db: SQLiteDatabase) {
        super('transactions', db);
    }

    async create(data: CreateTransaction): Promise<GenericAPIResponse<Transaction>> {
        const uuid = UUID();
        let transaction!: Transaction;
        let debitAccount: Account | null;
        let creditAccount: Account | null;
        const now = new Date().toISOString();
        const errorMessage = "Couldn't create transaction";
        await this.db.withTransactionAsync(async () => {
            await this.db.runAsync(
                `INSERT INTO transactions
                  (
                    id, created_at, updated_at, account_id, user_id, type,
                    amount, note, category, from_account, to_account, currency, plan_id
                  )
                VALUES
                  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    uuid,
                    now,
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

            // if the type is transfer, we need the debit & credit accounts to do math correctly
            if (data.type! == 'transfer') {
                debitAccount = await this.db.getFirstAsync<Account>(
                    'SELECT * from accounts where id = ?',
                    [data.from_account!],
                );
                creditAccount = await this.db.getFirstAsync<Account>(
                    'SELECT * from accounts where id = ?',
                    [data.to_account!],
                );

                if (!creditAccount || !debitAccount) throw new Error(errorMessage);
            }

            // update the account balance
            const accountBalance = await this.db.getFirstAsync<{ balance: number }>(
                'SELECT balance from accounts where id = ?',
                [data.account_id!],
            );

            if (accountBalance?.balance === undefined || accountBalance?.balance === null)
                throw Error(errorMessage);

            switch (data.type!) {
                case 'debit':
                    await this.db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?', [
                        accountBalance.balance - data.amount,
                        data.account_id,
                    ]);
                    break;
                case 'credit':
                    await this.db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?', [
                        accountBalance.balance + data.amount,
                        data.account_id,
                    ]);
                    break;
                case 'transfer':
                    if (!debitAccount || !creditAccount) throw new Error(errorMessage);
                    await this.db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?', [
                        debitAccount.balance - data.amount,
                        debitAccount.id,
                    ]);
                    await this.db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?', [
                        creditAccount.balance + data.amount,
                        creditAccount.id,
                    ]);
            }

            const result = await this.db.getFirstAsync<Transaction>(
                'SELECT * FROM transactions where id = ?',
                [uuid],
            );
            if (!result) throw new HTTPError(errorMessage, 500);
            transaction = result;
        });

        return this.formatResponse({
            data: transaction,
            status: 201,
            page: 1,
            page_size: 1,
            total: 1,
            total_items: 1,
            message: 'Created account',
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

    async list(query: RequestParamQuery): Promise<GenericAPIResponse<Transaction[]>> {
        const { page, page_size, accountID } = query;
        const offset = (page - 1) * page_size;
        const params: any[] = [];

        let whereClause = 't.deleted_at IS NULL';
        if (accountID) {
            whereClause += ' AND t.account_id = ?';
            params.push(accountID);
        }

        const result = await this.db.getFirstAsync<{ 'COUNT(*)': number }>(
            `SELECT COUNT(*) FROM transactions t WHERE ${whereClause}`,
            accountID ? [accountID] : [],
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
            LIMIT ? OFFSET ?`,
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
}
