import { BaseSQLiteService } from './SQLiteService';
import { Account } from '@/components/Accounts/schema';
import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import HTTPError from '../utils/error';
import { type SQLiteDatabase } from 'expo-sqlite';
import { UUID } from '../utils/helpers';
import { Plan } from '@/components/Plans/schema';

export class AccountSQLiteService extends BaseSQLiteService<Plan> {
    constructor(db: SQLiteDatabase) {
        super('plans', db);
    }

    async create(data: Partial<Plan>): Promise<GenericAPIResponse<Plan>> {
        let account!: Account;
        const uuid = UUID();
        const now = new Date().toISOString();
        await this.db.withTransactionAsync(async () => {
            await this.db.runAsync(
                `
                INSERT INTO accounts
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
            const result = await this.db.getFirstAsync<Plan>(
                'SELECT * FROM accounts where id = ?',
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

    async get(id: string): Promise<GenericAPIResponse<Plan>> {
        const account = await this.db.getFirstAsync<Plan>(
            `SELECT * FROM accounts WHERE deleted_at IS NULL AND id = ?`,
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

    async list(query: RequestParamQuery): Promise<GenericAPIResponse<Plan[]>> {
        const { page, limit } = query;
        const offset = (page - 1) * limit;
        const result = await this.db.getFirstAsync<{ 'COUNT(*)': number }>(
            'SELECT COUNT(*) FROM accounts WHERE deleted_at IS NULL',
        );
        if (!result) throw new Error('Error fetching transactions');
        const accounts = await this.db.getAllAsync<Plan>(
            `SELECT * FROM accounts
             WHERE deleted_at IS NULL
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [limit, offset],
        );

        return this.formatResponse({
            data: accounts,
            status: 200,
            page: Number(page),
            page_size: Number(limit),
            total: 1,
            total_items: result['COUNT(*)'],
            message: 'Success',
        });
    }
}
