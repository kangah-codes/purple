import React from 'react';
import { Text } from '../Shared/styled';
import {
    BudgetPlan,
    Deposit,
    ExpenseCalculationResult,
    Frequency,
    Plan,
    PlanAccountPieChartStats,
    PlanTransaction,
    SpendingProgress,
    SpendingTrendData,
    TrendDataPoint,
} from './schema';
import { formatDateTime } from '@/lib/utils/date';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { Account } from '../Accounts/schema';
import { generatePalette } from '@/lib/utils/colour';
import { Transaction } from '../Transactions/schema';

/**
 * Calculates the total expense details from an array of budget plans.
 * Only considers plans of type 'expense' and filters out any soft-deleted plans.
 *
 * @param {Plan[]} plans - An array of budget plans
 * @returns {Object} An object containing expense calculations and statistics
 */
export default function calculateTotalExpenseDetails(plans: Plan[]): ExpenseCalculationResult {
    // Filter for active expense plans only
    const expensePlans = plans.filter(
        (plan) => plan.type === 'expense' && plan.deleted_at === null,
    );

    // Calculate totals
    const totalExpense = expensePlans.reduce((acc, curr) => acc + curr.balance, 0);
    const totalBudget = expensePlans.reduce((acc, curr) => acc + curr.target, 0);

    // Prevent division by zero
    const totalExpensePercentage = totalBudget === 0 ? 0 : (totalExpense / totalBudget) * 100;

    const totalExpenseRemaining = totalBudget - totalExpense;
    const totalExpenseRemainingPercentage =
        totalBudget === 0 ? 0 : (totalExpenseRemaining / totalBudget) * 100;

    return {
        totalExpense,
        totalExpensePercentage,
        totalExpenseRemaining,
        totalExpenseRemainingPercentage,
        activePlansCount: expensePlans.length,
    };
}

export function calculateTotalSavingDetails(plans: Plan[]): ExpenseCalculationResult {
    // Filter for active expense plans only
    const savingPlans = plans.filter((plan) => plan.type === 'saving' && plan.deleted_at === null);

    // Calculate totals
    const totalSaving = savingPlans.reduce((acc, curr) => acc + curr.balance, 0);
    const totalGoal = savingPlans.reduce((acc, curr) => acc + curr.target, 0);

    // Prevent division by zero
    const totalSavingPercentage = totalGoal === 0 ? 0 : (totalSaving / totalGoal) * 100;

    const totalSavingRemaining = totalGoal - totalSaving;
    const totalSavingRemainingPercentage =
        totalGoal === 0 ? 0 : (totalSavingRemaining / totalGoal) * 100;

    return {
        totalExpense: totalSaving,
        totalExpensePercentage: totalSavingPercentage,
        totalExpenseRemaining: totalSavingRemaining,
        totalExpenseRemainingPercentage: totalSavingRemainingPercentage,
        activePlansCount: savingPlans.length,
    };
}

/**
 * Determines if a user's spending is on track based on time elapsed and amount spent
 *
 * @param {Plan} plan - The spending plan to evaluate
 * @returns {SpendingProgress} Detailed analysis of spending progress
 */
export function analyzeSpendingProgress(plan: Plan): SpendingProgress {
    const now = new Date();
    const startDate = new Date(plan.start_date);
    const endDate = new Date(plan.end_date);

    // Calculate time metrics
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Handle edge cases
    if (daysElapsed <= 0) {
        return createProgressResponse(true, 0, 0, 0, totalDays, 0, 0, 0, "Plan hasn't started yet");
    }

    if (daysElapsed > totalDays) {
        return createProgressResponse(
            plan.balance <= plan.target,
            plan.balance / totalDays,
            plan.target / totalDays,
            totalDays,
            totalDays,
            100,
            (plan.balance / plan.target) * 100,
            (plan.balance / plan.target - 1) * 100,
            'Plan period has ended',
        );
    }

    // Calculate rates and percentages
    const percentTimeElapsed = (daysElapsed / totalDays) * 100;
    const percentTargetSpent = (plan.balance / plan.target) * 100;

    const expectedSpendingRate = plan.target / totalDays;
    const actualSpendingRate = plan.balance / daysElapsed;

    // Calculate deviation from expected spending (negative means under budget)
    const deviation = percentTargetSpent - percentTimeElapsed;

    // Determine if on track (allowing for 10% deviation)
    const isOnTrack = Math.abs(deviation) <= 10;

    // Generate appropriate message
    let message = '';
    if (deviation < -10) {
        message = `Under budget by ${Math.abs(deviation).toFixed(1)}%`;
    } else if (deviation > 10) {
        message = `Over budget by ${deviation.toFixed(1)}%`;
    } else {
        message = 'Spending is on track';
    }

    return createProgressResponse(
        isOnTrack,
        actualSpendingRate,
        expectedSpendingRate,
        daysElapsed,
        totalDays,
        percentTimeElapsed,
        percentTargetSpent,
        deviation,
        message,
    );
}

/**
 * Helper function to create consistent SpendingProgress response
 */
function createProgressResponse(
    isOnTrack: boolean,
    actualSpendingRate: number,
    expectedSpendingRate: number,
    daysElapsed: number,
    totalDays: number,
    percentTimeElapsed: number,
    percentTargetSpent: number,
    deviation: number,
    message: string,
): SpendingProgress {
    return {
        isOnTrack,
        actualSpendingRate,
        expectedSpendingRate,
        daysElapsed,
        totalDays,
        percentTimeElapsed,
        percentTargetSpent,
        deviation,
        message,
    };
}

export function formatDateLabel(dateStr: string, showYear: boolean = false): string {
    const inputDate = new Date(dateStr);
    const currentDate = new Date();

    // Format date
    const month = inputDate.toLocaleString('en-US', { month: 'short' });
    const date = inputDate.getDate();
    const year = inputDate.getFullYear();
    const currentYear = currentDate.getFullYear();

    // Only include year if the date is from a different year
    return year !== currentYear
        ? `${date} ${month} ${year}`
        : `${date} ${month} ${showYear ? year : ''}`;
}

/**
 * Generates trend data for spending visualization
 *
 * @param {Plan} plan - The spending plan
 * @param {number} dataPoints - Number of points to generate (default 30)
 * @returns {SpendingTrendData} Object containing projected and actual spending trends
 */
export function generateSpendingTrendData(
    plan: Plan | null,
    dataPoints: number = 30,
    numberOfLabels: number = 3,
): SpendingTrendData {
    if (!plan) {
        return { projected: [], actual: [], ideal: [] };
    }

    const isExpense = plan.type === 'expense';

    const startDate = new Date(plan.start_date);
    const endDate = new Date(plan.end_date);
    const now = new Date();

    const totalDuration = endDate.getTime() - startDate.getTime();
    const timeInterval = totalDuration / (dataPoints - 1);

    const projected: TrendDataPoint[] = [];
    const actual: TrendDataPoint[] = [];
    const ideal: TrendDataPoint[] = [];

    const sortedTransactions = [...(plan.transactions || [])].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    function getAmountUpToDate(date: Date): number {
        const amount = sortedTransactions
            .filter((t) => new Date(t.created_at) <= date)
            .reduce((sum, t) => sum + (isNaN(t.amount) ? 0 : t.amount), 0);
        return isNaN(amount) ? 0 : amount;
    }

    const labelIndices = new Set<number>();
    if (numberOfLabels > 0) {
        const interval = (dataPoints - 1) / (numberOfLabels - 1);
        for (let i = 0; i < numberOfLabels; i++) {
            const index = Math.round(i * interval);
            if (index < dataPoints) {
                labelIndices.add(index);
            }
        }
    }

    const daysRemaining = Math.max(0, (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const remaining = isExpense ? plan.balance : plan.target - plan.balance;
    const projectedDailyRate = daysRemaining > 0 ? remaining / daysRemaining : 0;

    const normalizeValue = (value: number): number => value;

    for (let i = 0; i < dataPoints; i++) {
        const pointDate = new Date(startDate.getTime() + timeInterval * i);
        const daysFromStart = (pointDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        const totalDays = totalDuration / (1000 * 60 * 60 * 24);
        const dateStr = pointDate.toISOString().split('T')[0];
        const shouldAddLabel = labelIndices.has(i);

        // Ideal trend using curved progress
        const progress = daysFromStart / totalDays;
        const curvature = 1;
        const curvedProgress = curvature * progress * progress + (1 - curvature) * progress;
        let idealAmount = isExpense
            ? plan.target * (1 - curvedProgress)
            : plan.target * curvedProgress;
        idealAmount = Math.max(0, Math.min(idealAmount, plan.target || 0));

        ideal.push({
            date: dateStr,
            value: Number(normalizeValue(idealAmount).toFixed(2)),
            ...(shouldAddLabel && {
                labelComponent: () => (
                    <Text style={GLOBAL_STYLESHEET.satoshiBold} className='leading-5 text-xs'>
                        {formatDateLabel(dateStr)}
                    </Text>
                ),
            }),
        });

        const actualAmount = getAmountUpToDate(pointDate);
        const actualValue = isExpense ? plan.target - actualAmount : actualAmount;
        actual.push({
            date: dateStr,
            value: Number(normalizeValue(Math.max(0, actualValue)).toFixed(2)),
            ...(shouldAddLabel && {
                labelComponent: () => <Text>{formatDateLabel(dateStr)}</Text>,
            }),
        });

        if (pointDate >= now) {
            const currentAmount = getAmountUpToDate(now);
            const daysFromNow = (pointDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            let projectedAmount = currentAmount + projectedDailyRate * daysFromNow;
            let projectedValue = isExpense ? plan.target - projectedAmount : projectedAmount;
            projectedValue = Math.max(0, Math.min(projectedValue, plan.target || 0));

            projected.push({
                date: dateStr,
                value: Number(normalizeValue(projectedValue).toFixed(2)),
                ...(shouldAddLabel && {
                    labelComponent: () => <Text>{formatDateLabel(dateStr)}</Text>,
                }),
            });
        }
    }

    return { projected, actual, ideal };
}

export function calculateAmountAddedOnDay(
    transactions: Transaction[] | undefined,
    date?: Date,
): number {
    if (!transactions) return 0;

    let dateToUse = date || new Date();

    // check if any transactions were made on this day
    const transactionsOnDate = transactions.filter(
        (t) => new Date(t.created_at).toDateString() === dateToUse.toDateString(),
    );

    // if no transactions were made, return 0
    if (!transactionsOnDate || transactionsOnDate.length === 0) return 0;

    // sum up all transactions made on this day
    return transactionsOnDate.reduce(
        (acc, curr) => (curr.type == 'credit' ? acc + curr.amount : acc - curr.amount),
        0,
    );
}

export function getAccountTransactionStats(
    transactions: Transaction[] | undefined,
    accounts: Account[],
): PlanAccountPieChartStats[] {
    if (!transactions) return [];

    // Create a map to store stats for each account
    const statsMap = new Map<string, PlanAccountPieChartStats>();

    // Create a lookup map for account details
    const accountMap = new Map(accounts.map((account) => [account.id, account]));

    // Process all transactions
    transactions.forEach((transaction) => {
        if (transaction.from_account) {
            const account = accountMap.get(transaction.from_account);
            if (!account) return;

            let stats = statsMap.get(transaction.from_account);

            if (!stats) {
                const palette = generatePalette(account.id);
                stats = {
                    accountId: account.id,
                    accountName: account.name,
                    value: 0,
                    amount: 0,
                    color: palette.color600,
                    gradientCenterColor: palette.color300,
                    transactionCount: 0,
                };
                statsMap.set(account.id, stats);
            }

            stats.transactionCount += 1;
            stats.value += transaction.amount;
            stats.amount += transaction.amount;
        }
    });

    // Convert map to array and return only accounts with transactions
    return Array.from(statsMap.values()).sort((a, b) => b.amount - a.amount);
}

export function calculateRemainingForCurrentPeriod(
    startDate: Date,
    endDate: Date,
    targetAmount: number,
    frequency: Frequency,
    previousDeposits: Pick<Transaction, 'amount' | 'created_at'>[],
    isSpendingPlan = false,
): {
    remainingAmount: number;
    isOverPeriodAmount: boolean;
    overageAmount: number;
} {
    const now = new Date();

    // return early if plan hasn't started yet
    if (now < startDate) {
        return {
            remainingAmount: 0,
            isOverPeriodAmount: false,
            overageAmount: 0,
        };
    }

    if (now > endDate) {
        return {
            remainingAmount: 0,
            isOverPeriodAmount: false,
            overageAmount: 0,
        };
    }

    const totalPeriods = getNumberOfPeriods(startDate, endDate, frequency);
    const amountPerPeriod = targetAmount / totalPeriods;

    const totalThisPeriod = previousDeposits.reduce((sum, tx) => {
        const amount = isSpendingPlan ? Math.abs(tx.amount) : tx.amount;
        return sum + amount;
    }, 0);

    const remaining = amountPerPeriod - totalThisPeriod;
    const isOver = remaining < 0;

    return {
        remainingAmount: Math.max(remaining, 0),
        isOverPeriodAmount: isOver,
        overageAmount: isOver ? Math.abs(remaining) : 0,
    };
}

export function getNumberOfPeriods(startDate: Date, endDate: Date, frequency: Frequency): number {
    const days = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    if (frequency === 'weekly') return Math.ceil(days / 7);
    if (frequency === 'bi-weekly') return Math.ceil(days / 14);
    if (frequency === 'monthly') {
        return Math.ceil(
            (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                (endDate.getMonth() - startDate.getMonth()) +
                (endDate.getDate() >= startDate.getDate() ? 1 : 0),
        );
    }

    return 0;
}
