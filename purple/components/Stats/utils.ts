import {
    startOfMonth,
    getWeekOfMonth,
    endOfMonth,
    addDays,
    addWeeks,
    endOfWeek,
    format,
    isBefore,
    startOfWeek,
} from 'date-fns';
import { Transaction } from '../Transactions/schema';
import { dayKeys, dayLabels, weekColors } from './contants';

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

export const groupTransactionsByWeek = (transactions: Transaction[]) => {
    const weeks: Record<number, Record<string, number>> = {
        1: Object.fromEntries(dayKeys.map((k) => [k, 0])),
        2: Object.fromEntries(dayKeys.map((k) => [k, 0])),
        3: Object.fromEntries(dayKeys.map((k) => [k, 0])),
        4: Object.fromEntries(dayKeys.map((k) => [k, 0])),
    };

    for (const tx of transactions) {
        if (tx.type !== 'debit') continue;

        const date = new Date(tx.created_at);
        const week = getWeekOfMonth(date, { weekStartsOn: 0 });
        const key = getDayKey(date);

        if (weeks[week]) {
            weeks[week][key] += tx.amount;
        }
    }

    return weeks;
};

export const getStackedChartData = (transactions: Transaction[]) => {
    const grouped = groupTransactionsByWeek(transactions);

    const rawChartData = dayKeys.map((key) => {
        const stacks = Object.entries(grouped).map(([_, data], i) => ({
            value: data[key] || 0,
            color: weekColors[i],
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

export const generateMockTransactionsForMonth = (monthDate: Date): Transaction[] => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);

    const transactions: Transaction[] = [];
    let current = start;
    let id = 1;

    while (current <= end) {
        const dayIndex = current.getDay(); // 0 (Sun) to 6 (Sat)
        const week = getWeekOfMonth(current, { weekStartsOn: 0 });

        transactions.push({
            id: id.toString(),
            created_at: current.toISOString(),
            updated_at: current.toISOString(),
            deleted_at: null,
            account_id: 'acc1',
            user_id: 'user1',
            type: 'debit',
            amount: 100 * week + dayIndex * 10,
            account: {} as any,
            note: `Mock transaction ${id}`,
            category: 'Test',
            from_account: '',
            to_account: '',
            currency: 'USD',
            plan_id: '',
        });

        id++;
        current = addDays(current, 1);
    }

    return transactions;
};

export function getWeekRangesForMonth(date: Date): string[] {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const weeks: string[] = [];

    // Start from the first day of the month
    let currentWeekStart = monthStart;

    // Process exactly 4 weeks
    for (let weekIndex = 0; weekIndex < 4; weekIndex++) {
        // Calculate the end date of this week (6 days after start = 7 day period)
        let currentWeekEnd = addDays(currentWeekStart, 6);

        // For the 4th week, extend to the end of month if needed
        if (weekIndex === 3 && currentWeekEnd < monthEnd) {
            currentWeekEnd = monthEnd;
        }

        // If the end date exceeds the month end, cap it
        if (currentWeekEnd > monthEnd) {
            currentWeekEnd = monthEnd;
        }

        // Create the week label
        const label = `${format(currentWeekStart, 'MMM d')} - ${format(currentWeekEnd, 'MMM d')}`;
        weeks.push(label);

        // Move to the start of the next week (7 days from current start)
        currentWeekStart = addDays(currentWeekStart, 7);

        // If we've gone past the end of the month and it's not the last week yet,
        // we can stop as there are no more days to include
        if (currentWeekStart > monthEnd && weekIndex < 3) {
            break;
        }
    }

    return weeks;
}
