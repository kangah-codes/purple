import { BaseSQLiteService } from './SQLiteService';
import { Account } from '@/components/Accounts/schema';
import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import HTTPError from '../utils/error';
import { type SQLiteDatabase } from 'expo-sqlite';
import { UUID } from '../utils/helpers';

type CreateAccountPayload = {
    user_id?: string;
    category: string;
    name: string;
    balance: number;
    is_default_account: boolean;
    currency: string;
};

export class AccountSQLiteService extends BaseSQLiteService<Account> {
    constructor(db: SQLiteDatabase) {
        super('accounts', db);
    }

    async create(data: CreateAccountPayload): Promise<GenericAPIResponse<Account>> {
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
                    null,
                    data.category,
                    data.name,
                    data.balance,
                    data.is_default_account,
                    data.currency,
                ],
            );
            const result = await this.db.getFirstAsync<Account>(
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

    async get(id: string): Promise<GenericAPIResponse<Account>> {
        const account = await this.db.getFirstAsync<Account>(
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

    async list(query: RequestParamQuery): Promise<GenericAPIResponse<Account[]>> {
        const { page, limit } = query;
        const offset = (page - 1) * limit;
        const result = await this.db.getFirstAsync<{ 'COUNT(*)': number }>(
            'SELECT COUNT(*) FROM accounts WHERE deleted_at IS NULL',
        );
        if (!result) throw new Error('Error fetching transactions');
        const accounts = await this.db.getAllAsync<Account>(
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
