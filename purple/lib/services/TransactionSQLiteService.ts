import { BaseSQLiteService } from './SQLiteService';
import { Account } from '@/components/Accounts/schema';
import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import { Transaction } from '@/components/Transactions/schema';
import HTTPError from '../utils/error';
import { type SQLiteDatabase } from 'expo-sqlite';
import { UUID } from '../utils/helpers';

export class TransactionSQLiteService extends BaseSQLiteService<Transaction> {
    constructor(db: SQLiteDatabase) {
        super('transactions', db);
    }

    async create(data: Partial<Transaction>): Promise<GenericAPIResponse<Transaction>> {
        let debitAccount: Account | null;
        let creditAccount: Account | null;
        const uuid = UUID();
        let transaction!: Transaction;
        const now = new Date().toISOString();
        await this.db.withTransactionAsync(async () => {
            // create the transaction
            await this.db.runAsync(
                `
                INSERT INTO transactions
                  (
                    id, created_at, updated_at, account_id, user_id, type,
                    amount, note, category, from_account, to_account, currency, plan_id
                  )
                VALUES
                  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    uuid,
                    now,
                    now,
                    data.account_id!,
                    null,
                    data.type!,
                    data.amount!,
                    data.note ?? null,
                    data.category!,
                    data.from_account ?? null,
                    data.to_account ?? null,
                    data.currency!,
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

                if (!creditAccount || !debitAccount) throw new Error("Couldn't find accounts");
            }

            // update the account balance
            const accountBalance = await this.db.getFirstAsync<{ balance: number }>(
                'SELECT balance from accounts where id = ?',
                [data.account_id!],
            );

            if (!accountBalance?.balance) throw Error('Account not found');

            switch (data.type!) {
                case 'debit':
                    accountBalance.balance -= data.amount!;
                case 'credit':
                    accountBalance.balance += data.amount!;
                case 'transfer':
            }

            const result = await this.db.getFirstAsync<Transaction>(
                'SELECT * FROM transactions where id = ?',
                [uuid],
            );
            if (!result) throw new HTTPError('Error creating transaction', 500);
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
        const { page, page_size } = query;
        const offset = (page - 1) * page_size;
        const result = await this.db.getFirstAsync<{ 'COUNT(*)': number }>(
            'SELECT COUNT(*) FROM transactions WHERE deleted_at IS NULL',
        );
        if (!result) throw new Error('Error fetching transactions');
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
            WHERE t.deleted_at IS NULL
            ORDER BY t.created_at DESC
            LIMIT ? OFFSET ?`,
            [page_size, offset],
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
