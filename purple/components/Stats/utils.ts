import { addDays, differenceInDays, endOfMonth, format, startOfMonth } from 'date-fns';
import { Transaction } from '../Transactions/schema';
import { dayKeys, dayLabels, spendOverviewPalette } from './contants';

export function getCurrentMonthYear() {
    const date = new Date();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${month} ${year}`;
}

const getDayKey = (date: Date) => {
    const index = date.getDay();
    return dayKeys[index];
};

export const groupTransactionsByWeek = (transactions: Transaction[], currentDate = new Date()) => {
    const monthStart = startOfMonth(currentDate);
    const weeks: Record<number, Record<string, number>> = {
        1: Object.fromEntries(dayKeys.map((k) => [k, 0])),
        2: Object.fromEntries(dayKeys.map((k) => [k, 0])),
        3: Object.fromEntries(dayKeys.map((k) => [k, 0])),
        4: Object.fromEntries(dayKeys.map((k) => [k, 0])),
    };

    for (const tx of transactions) {
        if (tx.type !== 'debit') continue;

        const txDate = new Date(tx.created_at);
        const txMonth = txDate.getMonth();
        const currentMonth = currentDate.getMonth();

        if (txDate.getFullYear() !== currentDate.getFullYear() || txMonth !== currentMonth) {
            continue;
        }

        const daysSinceMonthStart = differenceInDays(txDate, monthStart);
        // determine week (1 indexed) based on days since month start
        // each week is 7 days starting from the 1st of the month
        let week = Math.floor(daysSinceMonthStart / 7) + 1;

        // limit at 4 wks
        if (week > 4) week = 4;

        const key = getDayKey(txDate);
        weeks[week][key] += tx.amount;
    }

    return weeks;
};

export const getStackedChartData = (transactions: Transaction[]) => {
    const grouped = groupTransactionsByWeek(transactions);
    const rawChartData = dayKeys.map((key) => {
        const stacks = Object.entries(grouped).map(([_, data], i) => ({
            value: data[key] || 0,
            color: spendOverviewPalette[i],
            marginBottom: 2,
        }));

        return {
            label: dayLabels[key],
            stacks,
        };
    });

    const maxTotal = Math.max(
        1,
        ...rawChartData.map(({ stacks }) => stacks.reduce((sum, s) => sum + s.value, 0)),
    );

    const paddedChartData = rawChartData.map(({ label, stacks }) => {
        const total = stacks.reduce((sum, s) => sum + s.value, 0);
        const padding = maxTotal - total;

        return {
            label,
            stacks: [
                ...stacks,
                ...(padding > 0 ? [{ value: padding, color: '#faf5ff', marginBottom: 2 }] : []),
            ],
        };
    });

    return paddedChartData;
};

export const generateMockTransactionsForMonth = (
    monthDate: Date,
    trend: boolean = false,
): Transaction[] => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const transactions: Transaction[] = [];
    let id = 1;
    let current = start;

    const totalDays = differenceInDays(end, start) + 1;
    const startAmount = 10;
    const endAmount = 10000;

    let previousAmount = startAmount;

    while (current <= end) {
        const numTransactionsToday = Math.floor(Math.random() * 6);

        for (let i = 0; i < numTransactionsToday; i++) {
            let amount: number;

            if (trend) {
                const progress = differenceInDays(current, start) / totalDays;
                const easedProgress = Math.pow(progress, 1.5);
                const baseAmount = startAmount + (endAmount - startAmount) * easedProgress;
                const randomFactor = 0.9 + Math.random() * 0.1;
                amount = baseAmount * randomFactor;
            } else {
                amount = previousAmount + Math.random() * 500;
            }

            amount = Math.max(amount, previousAmount + 1);

            transactions.push({
                id: id.toString(),
                created_at: current.toISOString(),
                updated_at: current.toISOString(),
                deleted_at: null,
                account_id: 'acc1',
                user_id: 'user1',
                type: trend
                    ? Math.random() > 0.3
                        ? 'credit'
                        : 'debit'
                    : Math.random() > 0.5
                      ? 'debit'
                      : 'credit',
                amount: parseFloat(amount.toFixed(2)),
                account: {} as any,
                note: `Mock transaction ${id}`,
                category: 'Test',
                from_account: '',
                to_account: '',
                currency: 'GHS',
                plan_id: '',
            } as Transaction);

            previousAmount = amount;
            id++;
        }

        current = addDays(current, 1);
    }

    return transactions;
};

export function getWeekRangesForMonth(date: Date): string[] {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const weeks: string[] = [];

    // start from the first day of the month
    let currentWeekStart = monthStart;

    // process exactly 4 weeks
    for (let weekIndex = 0; weekIndex < 4; weekIndex++) {
        // calculate the end date of this week (6 days after start = 7 day period)
        let currentWeekEnd = addDays(currentWeekStart, 6);

        // for the 4th week extend to the end of month if needed
        if (weekIndex === 3 && currentWeekEnd < monthEnd) {
            currentWeekEnd = monthEnd;
        }

        // if the end date exceeds the month end, cap it
        if (currentWeekEnd > monthEnd) {
            currentWeekEnd = monthEnd;
        }

        // create the week label
        const label = `${format(currentWeekStart, 'MMM d')} - ${format(currentWeekEnd, 'MMM d')}`;
        weeks.push(label);

        // move to the start of the next week (7 days from current start)
        currentWeekStart = addDays(currentWeekStart, 7);

        // if we've gone past the end of the month and it's not the last week yet
        // we can stop as there are no more days to include
        if (currentWeekStart > monthEnd && weekIndex < 3) {
            break;
        }
    }

    return weeks;
}
