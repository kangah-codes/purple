import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import { Account } from '@/components/Accounts/schema';
import { type SQLiteDatabase } from 'expo-sqlite';
import HTTPError from '../utils/error';
import { UUID } from '../utils/helpers';
import { BaseSQLiteService } from './SQLiteService';

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

    async update(
        id: string,
        data: Partial<
            Omit<
                Account,
                | 'id'
                | 'created_at'
                | 'created_at_unix'
                | 'deleted_at'
                | 'deleted_at_unix'
                | 'user_id'
                | 'is_default_account'
            >
        >,
    ): Promise<GenericAPIResponse<Account>> {
        const account = await this.db.getFirstAsync<Account>(
            `SELECT * FROM accounts WHERE deleted_at IS NULL AND id = ?`,
            [id],
        );
        if (!account) throw new HTTPError('Account not found', 404);

        const fields = Object.keys(data);
        if (fields.length === 0) {
            return this.formatResponse({
                data: account,
                status: 200,
                page: 1,
                page_size: 1,
                total: 1,
                total_items: 1,
                message: 'No changes made',
            });
        }

        const setString = fields.map((field) => `${field} = ?`).join(', ');
        const values = fields.map((field) => (data as any)[field]);
        values.push(new Date().toISOString()); // updated_at
        values.push(Math.floor(Date.now() / 1000).toString()); // updated_at_unix
        values.push(id); // where id = ?

        const updateQuery = `UPDATE accounts SET ${setString}, updated_at = ?, updated_at_unix = ? WHERE id = ?`;
        await this.db.runAsync(updateQuery, values);

        const updatedAccount = await this.db.getFirstAsync<Account>(
            `SELECT * FROM accounts WHERE deleted_at IS NULL AND id = ?`,
            [id],
        );
        if (!updatedAccount) throw new HTTPError('Error fetching updated account', 500);

        return this.formatResponse({
            data: updatedAccount,
            status: 200,
            page: 1,
            page_size: 1,
            total: 1,
            total_items: 1,
            message: 'Updated account',
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
            [result['COUNT(*)'], offset],
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
