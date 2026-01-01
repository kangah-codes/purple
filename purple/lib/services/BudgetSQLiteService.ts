import { GenericAPIResponse } from '@/@types/request';
import { type SQLiteDatabase } from 'expo-sqlite';
import HTTPError from '../utils/error';
import { UUID } from '../utils/helpers';
import { BaseSQLiteService } from './SQLiteService';

export interface Budget {
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    created_at_unix: number;
    updated_at_unix: number;
    deleted_at_unix: number | null;
    user_id: string | null;
    name: string;
    type: 'flex' | 'category';
    month: string;
    year: number;
    currency: string;
    estimated_income: number;
    estimated_spend: number;
    is_active: boolean;
    is_disabled: boolean;
}

export interface BudgetCategoryLimit {
    id: string;
    budget_id: string;
    category: string;
    limit_amount: number;
    spent_amount: number;
    rollover_enabled: boolean;
    notes: string | null;
}

export interface BudgetAllocation {
    id: string;
    budget_id: string;
    allocation_type: 'fixed' | 'flexible';
    category: string;
    allocated_amount: number;
    spent_amount: number;
    notes: string | null;
}

export interface BudgetWithDetails extends Budget {
    categoryLimits: BudgetCategoryLimit[];
    summary: {
        total_allocated: number;
        total_spent: number;
    } | null;
}

export interface CreateBudgetData {
    name: string;
    type: 'flex' | 'category';
    month: number;
    year: number;
    currency: string;
    estimatedIncome: number;
    estimatedSpend: number;
    categoryLimits: Array<{
        category: string;
        limitAmount: number;
    }>;
    flexAllocations?: Array<{
        category: string;
        allocationType: 'fixed' | 'flexible';
        amount: number;
    }>;
}

export class BudgetSQLiteService extends BaseSQLiteService<Budget> {
    constructor(db: SQLiteDatabase) {
        super('budgets', db);
    }

    private getMonthName(monthNumber: number): string {
        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
        return months[monthNumber - 1];
    }

    async create(data: CreateBudgetData): Promise<GenericAPIResponse<Budget>> {
        let budget!: Budget;
        const budgetId = UUID();
        const now = new Date().toISOString();
        const monthName = this.getMonthName(data.month);

        await this.db.withTransactionAsync(async () => {
            const existingBudget = await this.db.getFirstAsync<Budget>(
                `SELECT * FROM budgets WHERE month = ? AND year = ? AND deleted_at IS NULL`,
                [monthName, data.year],
            );

            if (existingBudget) {
                await this.db.runAsync(
                    `UPDATE budgets SET deleted_at = ?, deleted_at_unix = ? WHERE id = ?`,
                    [now, Math.floor(Date.now() / 1000), existingBudget.id],
                );

                await this.db.runAsync(
                    `UPDATE budget_category_limits SET deleted_at = ?, deleted_at_unix = ? WHERE budget_id = ?`,
                    [now, Math.floor(Date.now() / 1000), existingBudget.id],
                );

                await this.db.runAsync(
                    `UPDATE budget_allocations SET deleted_at = ?, deleted_at_unix = ? WHERE budget_id = ?`,
                    [now, Math.floor(Date.now() / 1000), existingBudget.id],
                );
            }

            await this.db.runAsync(
                `INSERT INTO budgets
                  (id, created_at, updated_at, name, type, month, year, currency, estimated_income, estimated_spend, is_active, is_disabled)
                VALUES
                  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    budgetId,
                    now,
                    now,
                    data.name,
                    data.type,
                    monthName,
                    data.year,
                    data.currency,
                    data.estimatedIncome,
                    data.estimatedSpend,
                    1,
                    0,
                ],
            );

            const totalAllocated = data.categoryLimits.reduce(
                (sum, limit) => sum + limit.limitAmount,
                0,
            );

            if (data.type === 'category' && data.categoryLimits.length > 0) {
                for (const limit of data.categoryLimits) {
                    const limitId = UUID();
                    await this.db.runAsync(
                        `INSERT INTO budget_category_limits
                          (id, created_at, updated_at, budget_id, category, limit_amount, spent_amount, rollover_enabled)
                        VALUES
                          (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [limitId, now, now, budgetId, limit.category, limit.limitAmount, 0, 0],
                    );
                }
            }

            if (data.type === 'flex' && data.flexAllocations && data.flexAllocations.length > 0) {
                for (const allocation of data.flexAllocations) {
                    const allocationId = UUID();
                    await this.db.runAsync(
                        `INSERT INTO budget_allocations
                          (id, created_at, updated_at, budget_id, allocation_type, category, allocated_amount, spent_amount)
                        VALUES
                          (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            allocationId,
                            now,
                            now,
                            budgetId,
                            allocation.allocationType,
                            allocation.category,
                            allocation.amount,
                            0,
                        ],
                    );
                }
            }

            const summaryId = UUID();
            await this.db.runAsync(
                `INSERT INTO budget_summaries
                  (id, created_at, updated_at, budget_id, total_allocated, total_spent)
                VALUES
                  (?, ?, ?, ?, ?, ?)`,
                [summaryId, now, now, budgetId, totalAllocated, 0],
            );

            const result = await this.db.getFirstAsync<Budget>(
                'SELECT * FROM budgets WHERE id = ?',
                [budgetId],
            );
            if (!result) throw new HTTPError('Error creating budget', 500);
            budget = result;
        });

        return this.formatResponse({
            data: budget,
            status: 201,
            page: 1,
            page_size: 1,
            total: 1,
            total_items: 1,
            message: 'Created budget',
        });
    }

    async getBudgetForMonth(
        month: string,
        year: number,
    ): Promise<GenericAPIResponse<BudgetWithDetails | null>> {
        const budget = await this.db.getFirstAsync<Budget>(
            `SELECT * FROM budgets WHERE month = ? AND year = ? AND deleted_at IS NULL`,
            [month, year],
        );

        if (!budget) {
            return this.formatResponse({
                data: null,
                status: 200,
                page: 1,
                page_size: 1,
                total: 1,
                total_items: 0,
                message: 'Success',
            });
        }

        const categoryLimits = await this.db.getAllAsync<BudgetCategoryLimit>(
            `SELECT * FROM budget_category_limits WHERE budget_id = ? AND deleted_at IS NULL`,
            [budget.id],
        );

        const summary = await this.db.getFirstAsync<{
            total_allocated: number;
            total_spent: number;
        }>(`SELECT total_allocated, total_spent FROM budget_summaries WHERE budget_id = ?`, [
            budget.id,
        ]);

        const budgetWithDetails: BudgetWithDetails = {
            ...budget,
            categoryLimits,
            summary: summary || null,
        };

        return this.formatResponse({
            data: budgetWithDetails,
            status: 200,
            page: 1,
            page_size: 1,
            total: 1,
            total_items: 1,
            message: 'Success',
        });
    }
}
