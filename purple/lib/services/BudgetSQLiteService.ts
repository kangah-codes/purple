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

export interface BudgetCategoryBudgetStats {
    lastMonthBudgeted: number;
    averageBudgeted: number;
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
        const nowUnix = Math.floor(Date.now() / 1000);
        const monthName = this.getMonthName(data.month);

        // TODO: handle more gracefully, but for now I just want to get the build working
        // up to future Joshua
        await this.db.withTransactionAsync(async () => {
            const existingBudget = await this.db.getFirstAsync<Budget>(
                `SELECT * FROM budgets WHERE month = ? AND year = ? AND deleted_at IS NULL`,
                [monthName, data.year],
            );

            const existingBudgetId = existingBudget?.id;

            if (existingBudget) {
                await this.db.runAsync(
                    `UPDATE budgets SET deleted_at = ?, deleted_at_unix = ? WHERE id = ?`,
                    [now, nowUnix, existingBudget.id],
                );

                await this.db.runAsync(
                    `UPDATE budget_category_limits SET deleted_at = ?, deleted_at_unix = ? WHERE budget_id = ?`,
                    [now, nowUnix, existingBudget.id],
                );

                await this.db.runAsync(
                    `UPDATE budget_allocations SET deleted_at = ?, deleted_at_unix = ? WHERE budget_id = ?`,
                    [now, nowUnix, existingBudget.id],
                );

                await this.db.runAsync(
                    `UPDATE budget_summaries SET deleted_at = ?, deleted_at_unix = ? WHERE budget_id = ?`,
                    [now, nowUnix, existingBudget.id],
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

            // If we're overriding an existing month's budget, migrate any linked transactions
            // and recompute spent values for the new budget so historical spend still appears.
            if (existingBudgetId) {
                await this.db.runAsync(
                    `UPDATE transactions SET budget_id = ?, updated_at = ? WHERE budget_id = ? AND deleted_at IS NULL`,
                    [budgetId, now, existingBudgetId],
                );

                // Recompute total_spent from transactions for this budget
                await this.db.runAsync(
                    `UPDATE budget_summaries
                     SET total_spent = (
                        SELECT COALESCE(SUM(amount), 0)
                        FROM transactions
                                                WHERE budget_id = ?
                                                    AND type = 'debit'
                                                    AND (from_account IS NULL OR from_account = '')
                                                    AND (to_account IS NULL OR to_account = '')
                                                    AND deleted_at IS NULL
                     ), updated_at = ?
                     WHERE budget_id = ?`,
                    [budgetId, now, budgetId],
                );

                // Recompute spent per category for category budgets
                if (data.type === 'category' && data.categoryLimits.length > 0) {
                    for (const limit of data.categoryLimits) {
                        await this.db.runAsync(
                            `UPDATE budget_category_limits
                             SET spent_amount = (
                                SELECT COALESCE(SUM(amount), 0)
                                FROM transactions
                                WHERE budget_id = ?
                                  AND type = 'debit'
                                  AND (from_account IS NULL OR from_account = '')
                                  AND (to_account IS NULL OR to_account = '')
                                  AND category = ?
                                  AND deleted_at IS NULL
                             ), updated_at = ?
                             WHERE budget_id = ? AND category = ? AND deleted_at IS NULL`,
                            [budgetId, limit.category, now, budgetId, limit.category],
                        );
                    }
                }

                // Recompute spent per category for flex allocations (if used)
                if (
                    data.type === 'flex' &&
                    data.flexAllocations &&
                    data.flexAllocations.length > 0
                ) {
                    for (const allocation of data.flexAllocations) {
                        await this.db.runAsync(
                            `UPDATE budget_allocations
                             SET spent_amount = (
                                SELECT COALESCE(SUM(amount), 0)
                                FROM transactions
                                WHERE budget_id = ?
                                  AND type = 'debit'
                                  AND (from_account IS NULL OR from_account = '')
                                  AND (to_account IS NULL OR to_account = '')
                                  AND category = ?
                                  AND deleted_at IS NULL
                             ), updated_at = ?
                             WHERE budget_id = ? AND category = ? AND deleted_at IS NULL`,
                            [budgetId, allocation.category, now, budgetId, allocation.category],
                        );
                    }
                }
            }

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
        }>(
            `SELECT total_allocated, total_spent FROM budget_summaries WHERE budget_id = ? AND deleted_at IS NULL`,
            [budget.id],
        );

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

    async getCategoryBudgetStats(
        category: string,
        referenceDate: Date = new Date(),
    ): Promise<GenericAPIResponse<BudgetCategoryBudgetStats>> {
        const lastMonthDate = new Date(
            referenceDate.getFullYear(),
            referenceDate.getMonth() - 1,
            1,
        );
        const lastMonthName = this.getMonthName(lastMonthDate.getMonth() + 1);
        const lastMonthYear = lastMonthDate.getFullYear();

        const lastMonthRow = await this.db.getFirstAsync<{ limit_amount: number | string }>(
            `SELECT bcl.limit_amount AS limit_amount
             FROM budgets b
             INNER JOIN budget_category_limits bcl ON bcl.budget_id = b.id
             WHERE b.month = ?
               AND b.year = ?
               AND b.deleted_at IS NULL
               AND bcl.deleted_at IS NULL
               AND bcl.category = ?
             LIMIT 1`,
            [lastMonthName, lastMonthYear, category],
        );

        const avgRow = await this.db.getFirstAsync<{ avg_limit: number | string | null }>(
            `SELECT AVG(bcl.limit_amount) AS avg_limit
             FROM budgets b
             INNER JOIN budget_category_limits bcl ON bcl.budget_id = b.id
             WHERE b.deleted_at IS NULL
               AND bcl.deleted_at IS NULL
               AND bcl.category = ?`,
            [category],
        );

        const lastMonthBudgeted = Number(lastMonthRow?.limit_amount ?? 0);
        const averageBudgeted = Number(avgRow?.avg_limit ?? 0);

        return this.formatResponse({
            data: {
                lastMonthBudgeted: Number.isFinite(lastMonthBudgeted) ? lastMonthBudgeted : 0,
                averageBudgeted: Number.isFinite(averageBudgeted) ? averageBudgeted : 0,
            },
            status: 200,
            page: 1,
            page_size: 1,
            total: 1,
            total_items: 1,
            message: 'Success',
        });
    }
}
