import { BaseSQLiteService } from './SQLiteService';
import { Account } from '@/components/Accounts/schema';
import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import HTTPError from '../utils/error';
import { type SQLiteDatabase } from 'expo-sqlite';
import { UUID } from '../utils/helpers';
import { format, parse } from 'date-fns';

type CreateAccountPayload = {
    user_id?: string;
    category: string;
    subcategory?: string;
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
            if (data.is_default_account) {
                const existingDefault = await this.db.getFirstAsync<Account>(
                    'SELECT * FROM accounts WHERE is_default_account = 1 AND category = ?',
                    [data.category],
                );

                if (existingDefault) {
                    throw new HTTPError('Default account already exists for this category', 409);
                }
            }

            await this.db.runAsync(
                `
                INSERT INTO accounts
                  (id, created_at, updated_at, user_id, category, subcategory, name, balance, is_default_account, currency)
                VALUES
                  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    uuid,
                    now,
                    now,
                    null,
                    data.category,
                    data.subcategory ?? null,
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
        const { page = 1, page_size = 10 } = query;
        const offset = (page - 1) * page_size;
        const result = await this.db.getFirstAsync<{ 'COUNT(*)': number }>(
            'SELECT COUNT(*) FROM accounts WHERE deleted_at IS NULL',
        );
        if (!result) throw new Error('Error fetching accounts');
        const accounts = await this.db.getAllAsync<Account>(
            `SELECT * FROM accounts
             WHERE deleted_at IS NULL
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [page_size, offset],
        );

        return this.formatResponse({
            data: accounts,
            status: 200,
            page: Number(page),
            page_size: Number(page_size),
            total: 1,
            total_items: result['COUNT(*)'],
            message: 'Success',
        });
    }

    async delete(id: string): Promise<GenericAPIResponse<null>> {
        const account = await this.db.getFirstAsync<{ is_default_account: number }>(
            `SELECT is_default_account FROM accounts WHERE id = ? AND deleted_at IS NULL`,
            [id],
        );
        if (!account) {
            throw new HTTPError('Account not found', 404);
        }
        if (account.is_default_account) {
            throw new HTTPError('Cannot delete your default account', 400);
        }
        await this.db.withTransactionAsync(async () => {
            await this.db.runAsync(`DELETE from accounts where id = ?`, [id]);
            await this.db.runAsync('DELETE FROM transactions where account_id = ?', [id]);
            await this.db.runAsync('DELETE FROM recurring_transactions where account_id = ?', [id]);
        });

        return this.formatResponse({
            data: null,
            status: 200,
            page: 1,
            page_size: 1,
            total: 1,
            total_items: 1,
            message: 'Deleted account',
        });
    }
}
