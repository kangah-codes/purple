import {
    BudgetPlan,
    ExpenseCalculationResult,
    Plan,
    SpendingProgress,
    SpendingTrendData,
    TrendDataPoint,
} from './schema';

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

/**
 * Generates trend data for spending visualization
 *
 * @param {Plan} plan - The spending plan
 * @param {number} dataPoints - Number of points to generate (default 30)
 * @returns {SpendingTrendData} Object containing projected and actual spending trends
 */
export function generateSpendingTrendData(plan: Plan, dataPoints: number = 30): SpendingTrendData {
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

    // Calculate daily rate for ideal spending
    const dailyIdealRate = plan.target / (totalDuration / (1000 * 60 * 60 * 24));

    // Calculate actual daily rate based on current balance
    const daysElapsed = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const actualDailyRate = plan.balance / daysElapsed;

    // Generate data points
    for (let i = 0; i < dataPoints; i++) {
        const pointDate = new Date(startDate.getTime() + timeInterval * i);
        const daysFromStart = (pointDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

        // Format date for output
        const dateStr = pointDate.toISOString().split('T')[0];

        // Calculate ideal trend (linear)
        const idealAmount = Math.min(dailyIdealRate * daysFromStart, plan.target);
        ideal.push({
            date: dateStr,
            amount: Number(idealAmount.toFixed(2)),
        });

        // Calculate actual spending (only up to current date)
        if (pointDate <= now) {
            const actualAmount = Math.min(actualDailyRate * daysFromStart, plan.balance);
            actual.push({
                date: dateStr,
                amount: Number(actualAmount.toFixed(2)),
            });
        }

        // Calculate projected spending (from current date to end)
        if (pointDate >= now) {
            const daysRemaining = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            const remainingBudget = plan.target - plan.balance;
            const projectedDailyRate = remainingBudget / daysRemaining;
            const daysFromNow = (pointDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

            const projectedAmount = Math.min(
                plan.balance + projectedDailyRate * daysFromNow,
                plan.target,
            );

            projected.push({
                date: dateStr,
                amount: Number(projectedAmount.toFixed(2)),
            });
        }
    }

    return { projected, actual, ideal };
}
