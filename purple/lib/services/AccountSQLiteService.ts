import { BaseSQLiteService } from './SQLiteService';
import { Account } from '@/components/Accounts/schema';
import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import HTTPError from '../utils/error';
import { type SQLiteDatabase } from 'expo-sqlite';
import { UUID } from '../utils/helpers';

export class AccountSQLiteService extends BaseSQLiteService<Account> {
    constructor(db: SQLiteDatabase) {
        super('account', db);
    }

    async create(data: Partial<Account>): Promise<GenericAPIResponse<Account>> {
        let account!: Account;
        const uuid = UUID();
        const now = new Date().toISOString();
        await this.db.withTransactionAsync(async () => {
            await this.db.runAsync(
                `
                INSERT INTO account
                  (id, created_at, updated_at, user_id, category, name, balance, is_default_account, currency)
                VALUES
                  (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    uuid,
                    now,
                    now,
                    data.user_id!,
                    data.category!,
                    data.name!,
                    data.balance!,
                    data.is_default_account!,
                    data.currency!,
                ],
            );
            const result = await this.db.getFirstAsync<Account>(
                'SELECT * FROM account where id = ?',
                [uuid],
            );
            if (!result) throw new HTTPError('Error creating account', 500);
            account = result;
        });

        return this.formatResponse({
            data: account,
            status: 201,
            page: 1,
            page_size: 1,
            total: 1,
            total_items: 1,
            message: 'Created account',
        });
    }

    async get(id: string): Promise<GenericAPIResponse<Account>> {
        const account = await this.db.getFirstAsync<Account>(
            `SELECT * FROM account WHERE deleted_at IS NULL AND id = ?`,
            [id],
        );

        if (!account) throw new HTTPError('Account not found', 404);

        return this.formatResponse({
            data: account,
            status: 200,
            page: 1,
            page_size: 1,
            total: 1,
            total_items: 1,
            message: 'Success',
        });
    }

    async list(query: RequestParamQuery): Promise<GenericAPIResponse<Account[]>> {
        const { page, limit } = query;
        const offset = (page - 1) * limit;
        const result = await this.db.getAllAsync<Account & { total_count: number }>(
            `SELECT t.*, (SELECT COUNT(*) FROM account WHERE deleted_at IS NULL) as total_count
             FROM transactions t
             WHERE t.deleted_at IS NULL
             ORDER BY t.created_at DESC
             LIMIT ? OFFSET ?`,
            [limit, offset],
        );

        if (!result || result.length === 0) throw new Error('Error fetching accounts');
        const total_count = result[0]?.total_count ?? 0;
        const accounts = result.map(({ total_count: _, ...transaction }) => transaction);

        return this.formatResponse({
            data: accounts,
            status: 200,
            page: Number(page),
            page_size: Number(limit),
            total: 1,
            total_items: total_count,
            message: 'Success',
        });
    }
}
