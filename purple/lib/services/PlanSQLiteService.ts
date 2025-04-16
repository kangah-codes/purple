import { BaseSQLiteService } from './SQLiteService';
import { Account } from '@/components/Accounts/schema';
import { GenericAPIResponse, RequestParamQuery } from '@/@types/request';
import HTTPError from '../utils/error';
import { type SQLiteDatabase } from 'expo-sqlite';
import { UUID } from '../utils/helpers';
import { CreatePlan, CreatePlanTransaction, Plan } from '@/components/Plans/schema';
import { Transaction } from '@/components/Transactions/schema';

export class PlanSQLiteService extends BaseSQLiteService<Plan> {
    constructor(db: SQLiteDatabase) {
        super('plans', db);
    }

    async create(data: CreatePlan): Promise<GenericAPIResponse<Plan>> {
        let plan!: Plan;
        const uuid = UUID();
        const now = new Date().toISOString();
        await this.db.withTransactionAsync(async () => {
            await this.db.runAsync(
                `
                INSERT INTO plans
                  (id, created_at, updated_at, type, category, target, balance, start_date, end_date, deposit_frequency, name, currency)
                VALUES
                  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    uuid,
                    now,
                    now,
                    data.type,
                    data.category,
                    data.target,
                    0, // init the plan with 0 balance
                    data.start_date,
                    data.end_date,
                    data.deposit_frequency,
                    data.name,
                    data.currency,
                ],
            );
            const result = await this.db.getFirstAsync<Plan>('SELECT * FROM plans where id = ?', [
                uuid,
            ]);
            if (!result) throw new HTTPError('Error creating plan', 500);
            plan = result;
        });

        return this.formatResponse({
            data: plan,
            status: 201,
            page: 1,
            page_size: 1,
            total: 1,
            total_items: 1,
            message: 'Created plan',
        });
    }

    async createTransaction(
        data: CreatePlanTransaction,
        planData: { type: Plan['type']; id: string; name: string },
    ): Promise<GenericAPIResponse<Transaction>> {
        let planEmoji: string;
        if (planData.type == 'saving') {
            planEmoji = '💰';
        } else {
            planEmoji = '📉';
        }
        const account = await this.db.getFirstAsync<Account>(
            `SELECT * from accounts where deleted_at IS NULL AND id = ?`,
            [data.debit_account_id],
        );
        if (!account) throw new Error('Error creating transaction');

        const plan = await this.db.getFirstAsync<Plan>(
            'SELECT * from plans where deleted_at IS NULL AND id = ?',
            [planData.id],
        );
        if (!plan) throw new Error('Error creating transaction');

        const uuid = UUID();
        let transaction!: Transaction;
        const now = new Date().toISOString();

        await this.db.withTransactionAsync(async () => {
            await this.db.runAsync(
                `INSERT INTO transactions
                (
                  id, created_at, updated_at, account_id, user_id, type,
                  amount, note, category, currency, plan_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    uuid,
                    now,
                    now,
                    account.id,
                    null,
                    'debit',
                    data.amount,
                    data.note ?? null,
                    `${planEmoji} ${planData.name}`,
                    account.currency,
                    planData.id,
                ],
            );

            await this.db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?', [
                account.balance - data.amount,
                data.debit_account_id,
            ]);

            await this.db.runAsync('UPDATE plans SET balance = ? where id = ?', [
                plan.balance + data.amount,
                plan.id,
            ]);

            const result = await this.db.getFirstAsync<Transaction>(
                'SELECT * FROM transactions where id = ?',
                [uuid],
            );

            if (!result) throw new Error('Error creating transaction');
            transaction = result;
        });

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

    async delete(id: string): Promise<GenericAPIResponse<null>> {
        await this.db.runAsync(`DELETE from plans where id = ?`, [id]);
        return this.formatResponse({
            data: null,
            status: 200,
            page: 1,
            page_size: 1,
            total: 1,
            total_items: 1,
            message: 'Deleted plan',
        });
    }

    async get(id: string): Promise<GenericAPIResponse<Plan>> {
        const plan = await this.db.getFirstAsync<Plan>(
            `SELECT * FROM plans WHERE deleted_at IS NULL AND id = ?`,
            [id],
        );
        if (!plan) throw new HTTPError('Plan not found', 404);
        const planTransactions = await this.db.getAllAsync<
            Transaction & {
                account_id: string;
                account_currency: string;
                account_name: string;
            }
        >(
            `SELECT t.*, a.id as account_id, a.name as account_name, a.currency as account_currency
              FROM transactions t
              INNER JOIN accounts a ON t.account_id = a.id
              WHERE t.plan_id = ?`,
            [id],
        );

        return this.formatResponse({
            data: {
                ...plan,
                transactions: planTransactions.map((transaction) => ({
                    ...transaction,
                    currency: transaction.account_currency,
                    account: {
                        id: transaction.account_id,
                        name: transaction.account_name,
                    },
                })) as unknown as Transaction[],
            },
            status: 200,
            page: 1,
            page_size: 1,
            total: 1,
            total_items: 1,
            message: 'Success',
        });
    }

    async list(query: RequestParamQuery): Promise<GenericAPIResponse<Plan[]>> {
        const { page = 1, page_size = 10, type } = query;
        const offset = (page - 1) * page_size;
        const params: any[] = [];

        let whereClause = 'p.deleted_at IS NULL';
        if (type) {
            whereClause += ' AND p.type = ?';
            params.push(type);
        }

        const result = await this.db.getFirstAsync<{ 'COUNT(*)': number }>(
            `SELECT COUNT(*) FROM plans p WHERE ${whereClause}`,
            type ? [type] : [],
        );
        if (!result) throw new Error('Error fetching plans');

        params.push(page_size, offset);
        const plans = await this.db.getAllAsync<Plan>(
            `SELECT p.* FROM plans p
             WHERE ${whereClause}
             ORDER BY p.created_at DESC
             LIMIT ? OFFSET ?`,
            params,
        );

        return this.formatResponse({
            data: plans,
            status: 200,
            page: Number(page),
            page_size: Number(page_size),
            total: 1,
            total_items: result['COUNT(*)'],
            message: 'Success',
        });
    }
}
