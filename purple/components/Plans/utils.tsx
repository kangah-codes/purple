import React from 'react';
import { Text } from '../Shared/styled';
import {
    BudgetPlan,
    ExpenseCalculationResult,
    Plan,
    SpendingProgress,
    SpendingTrendData,
    TrendDataPoint,
} from './schema';
import { formatDateTime } from '@/lib/utils/date';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';

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

function formatDateLabel(dateStr: string): string {
    const inputDate = new Date(dateStr);
    const currentDate = new Date();

    // Format date
    const month = inputDate.toLocaleString('en-US', { month: 'short' });
    const date = inputDate.getDate();
    const year = inputDate.getFullYear();
    const currentYear = currentDate.getFullYear();

    // Only include year if the date is from a different year
    return year !== currentYear ? `${date} ${month} ${year}` : `${date} ${month}`;
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
    normalize: boolean = false,
): SpendingTrendData {
    if (!plan) {
        return { projected: [], actual: [], ideal: [] };
    }

    const startDate = new Date(plan.start_date);
    const endDate = new Date(plan.end_date);
    const now = new Date();

    // Calculate time intervals
    const totalDuration = endDate.getTime() - startDate.getTime();
    const timeInterval = totalDuration / (dataPoints - 1);

    // Initialize return arrays
    const projected: TrendDataPoint[] = [];
    const actual: TrendDataPoint[] = [];
    const ideal: TrendDataPoint[] = [];

    // Sort transactions by date
    const sortedTransactions = [...(plan.Transactions || [])].sort(
        (a, b) => new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime(),
    );

    // Calculate cumulative transaction amounts up to each date
    function getAmountUpToDate(date: Date): number {
        const amount = sortedTransactions
            .filter((t) => new Date(t.CreatedAt) <= date)
            .reduce((sum, t) => sum + (isNaN(t.amount) ? 0 : t.amount), 0);
        return isNaN(amount) ? 0 : amount;
    }

    // Pre-calculate the label indices for even spacing
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

    // Calculate daily rate based on remaining budget and time
    const daysRemaining = Math.max(0, (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const remainingBudget = isNaN(plan.target - plan.balance) ? 0 : plan.target - plan.balance;
    const projectedDailyRate = daysRemaining > 0 ? remainingBudget / daysRemaining : 0;

    // Function to normalize values to 0-100 scale
    const normalizeValue = (value: number): number => {
        // if (!normalize || plan.target <= 0) return value;
        // return (value / plan.target) * 100;

        return value;
    };

    // Generate data points
    // const dataPoints: { date: string; amount: number }[] = [];
    for (let i = 0; i < dataPoints; i++) {
        const pointDate = new Date(startDate.getTime() + timeInterval * i);
        const daysFromStart = (pointDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        const totalDays = totalDuration / (1000 * 60 * 60 * 24);

        // Format date for output
        const dateStr = pointDate.toISOString().split('T')[0];
        const shouldAddLabel = labelIndices.has(i);

        // Calculate ideal trend (curved using quadratic function)
        const progress = daysFromStart / totalDays;
        const curvature = 1;
        const curvedProgress = curvature * progress * progress + (1 - curvature) * progress;
        let idealAmount = plan.target * curvedProgress;
        idealAmount = isNaN(idealAmount) ? 0 : Math.min(idealAmount, plan.target || 0);

        ideal.push({
            date: dateStr,
            value: Number(normalizeValue(idealAmount).toFixed(2)),
            ...(shouldAddLabel && {
                labelComponent: () => (
                    <Text style={GLOBAL_STYLESHEET.gramatikaBold} className='leading-5 text-xs'>
                        {formatDateLabel(dateStr)}
                    </Text>
                ),
            }),
        });

        // Calculate actual spending (only up to current date)
        if (pointDate <= now) {
            const actualAmount = getAmountUpToDate(pointDate);
            actual.push({
                date: dateStr,
                value: Number(normalizeValue(isNaN(actualAmount) ? 0 : actualAmount).toFixed(2)),
                ...(shouldAddLabel && {
                    labelComponent: () => <Text>{formatDateLabel(dateStr)}</Text>,
                }),
            });
        }

        // Calculate projected spending (from current date to end)
        if (pointDate >= now) {
            const currentAmount = getAmountUpToDate(now);
            const daysFromNow = (pointDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            let projectedAmount = currentAmount + projectedDailyRate * daysFromNow;
            projectedAmount = isNaN(projectedAmount)
                ? 0
                : Math.min(projectedAmount, plan.target || 0);

            projected.push({
                date: dateStr,
                value: Number(normalizeValue(projectedAmount).toFixed(2)),
                ...(shouldAddLabel && {
                    labelComponent: () => <Text>{formatDateLabel(dateStr)}</Text>,
                }),
            });
        }
    }

    return { projected, actual, ideal };
}

export function calculateAmountAddedOnDay(plan: Plan | null, date?: Date): number {
    if (!plan) return 0;

    let dateToUse = date || new Date();

    // check if any transactions were made on this day
    const transactionsOnDate = plan.Transactions?.filter(
        (t) => new Date(t.CreatedAt).toDateString() === dateToUse.toDateString(),
    );

    // if no transactions were made, return 0
    if (!transactionsOnDate || transactionsOnDate.length === 0) return 0;

    // sum up all transactions made on this day
    return transactionsOnDate.reduce((acc, curr) => acc + curr.amount, 0);
}
