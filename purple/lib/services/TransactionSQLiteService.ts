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
        let transaction!: Transaction;
        const now = new Date().toISOString();
        const uuid = UUID();
        await this.db.withTransactionAsync(async () => {
            await this.db.runAsync(
                `
                INSERT INTO transactions
                  (
                    id, created_at, updated_at, account_id, user_id, type,
                    amount, note, category, from_account, to_account, currency, plan_id
                  )
                VALUES
                  (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    uuid,
                    now,
                    now,
                    data.account_id!,
                    data.user_id!,
                    data.Type!,
                    data.amount!,
                    data.note ?? null,
                    data.category!,
                    data.from_account ?? null,
                    data.to_account ?? null,
                    data.currency!,
                    data.plan_id ?? null,
                ],
            );
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
        const { page, limit } = query;
        const offset = (page - 1) * limit;
        const result = await this.db.getFirstAsync<{ 'COUNT(*)': number }>(
            'SELECT COUNT(*) FROM transactions WHERE deleted_at IS NULL',
        );
        if (!result) throw new Error('Error fetching transactions');
        const transactions = await this.db.getAllAsync<Transaction>(
            `SELECT * FROM transactions
             WHERE deleted_at IS NULL
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [limit, offset],
        );

        return this.formatResponse({
            data: transactions,
            status: 200,
            page: Number(page),
            page_size: Number(limit),
            total: 1,
            total_items: result['COUNT(*)'],
            message: 'Success',
        });
    }
}
