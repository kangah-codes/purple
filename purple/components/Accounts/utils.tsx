import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { groupBy } from '@/lib/utils/helpers';
import {
    eachDayOfInterval,
    endOfMonth,
    format,
    isSameMonth,
    min,
    parseISO,
    addDays,
} from 'date-fns';
import React from 'react';
import { formatDateLabel } from '../Plans/utils';
import { Text } from '../Shared/styled';
import { Transaction } from '../Transactions/schema';
import { isTransferTransaction } from '../Transactions/utils';
import { Account } from './schema';

export function createTransactionChartData(
    transactions: Transaction[],
    numberOfLabels: number = 3,
): { date: string; value: number }[] {
    if (transactions.length === 0) {
        return [];
    }

    // Get the oldest and newest dates
    const minDate = new Date(
        Math.min(...transactions.map((t) => new Date(t.created_at).getTime())),
    );
    const maxDate = new Date(
        Math.max(...transactions.map((t) => new Date(t.created_at).getTime())),
    );

    // Pre-calculate the label indices for even spacing
    const labelIndices = new Set<number>();
    if (numberOfLabels > 0) {
        const interval = (transactions.length - 1) / (numberOfLabels - 1);
        for (let i = 0; i < numberOfLabels; i++) {
            const index = Math.round(i * interval);
            if (index < transactions.length) {
                labelIndices.add(index);
            }
        }
    }

    // Create an array of all dates between the min and max date
    const allDates: string[] = [];
    const currentDate = new Date(minDate);
    while (currentDate <= maxDate) {
        allDates.push(currentDate.toLocaleDateString());
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Convert the data object to an array of { date, value } objects
    const chartData: { date: string; value: number }[] = [];
    for (let i = transactions.length - 1; i >= 0; i--) {
        const shouldAddLabel = labelIndices.has(i);
        const dateStr = new Date(transactions[i].created_at).toISOString().split('T')[0];
        chartData.push({
            date: dateStr,
            value: transactions[i].amount,
            ...(shouldAddLabel && {
                labelComponent: () => (
                    <Text style={GLOBAL_STYLESHEET.satoshiBold} className='leading-5 text-xs'>
                        {formatDateLabel(dateStr, true)}
                    </Text>
                ),
            }),
        });
    }
    return chartData;
}

export function groupAccountsByCategory(accounts: Account[]): Record<string, Account[]> {
    // First group by category only
    const groupedByCategory = groupBy(accounts, 'category');

    // Then check each category and split by currency if needed
    const finalGroups: Record<string, Account[]> = {};

    Object.entries(groupedByCategory).forEach(([category, categoryAccounts]) => {
        const currencies = new Set(categoryAccounts.map((account) => account.currency));

        if (currencies.size > 1) {
            // Multiple currencies exist, group by both category and currency
            categoryAccounts.forEach((account) => {
                const key = `${category}_${account.currency}`;
                if (!finalGroups[key]) {
                    finalGroups[key] = [];
                }
                finalGroups[key].push(account);
            });
        } else {
            // Single currency, just use category
            finalGroups[category] = categoryAccounts;
        }
    });

    return finalGroups;
}

type ChartPoint = {
    value: number;
    date: string;
};

export function generateChartData(
    transactions: Array<Transaction & { account_category?: string }>,
): (ChartPoint & { label?: string })[] {
    const dailyTotals: Record<string, number> = {};

    for (const tx of transactions) {
        const isoDate = format(new Date(tx.created_at), 'yyyy-MM-dd');

        if (!dailyTotals[isoDate]) {
            dailyTotals[isoDate] = 0;
        }

        // for liability accounts we want the chart to go down
        // for asset accounts, we want the chart to go up
        if (isLiabilityAccount(tx.account?.subcategory || tx.account_category)) {
            // for liability accounts credits reduce the liability debits increase it
            // so we want credits to be positive and debits to be negative
            dailyTotals[isoDate] += tx.type === 'credit' ? tx.amount : -tx.amount;
        } else {
            // asset accounts are opposite
            dailyTotals[isoDate] += tx.type === 'credit' ? tx.amount : -tx.amount;
        }
    }

    let runningBalance = 0;
    const sortedEntries = Object.entries(dailyTotals).sort(
        ([a], [b]) => new Date(a).getTime() - new Date(b).getTime(),
    );

    const chartData = sortedEntries.map(([isoDate, value]) => {
        runningBalance += value;
        return {
            date: format(parseISO(isoDate), 'd MMM yyyy'),
            value: runningBalance < 0 ? 0 : runningBalance,
        };
    });

    return chartData;
}

export function isLiabilityAccount(accountCategory?: string): boolean {
    if (!accountCategory) return false;
    return accountCategory === '📉 Liability' || accountCategory.startsWith('📉 Liability');
}

export function getEffectiveBalance(account: Account): number {
    const isLiability = isLiabilityAccount(account.category);
    return isLiability ? -Math.abs(account.balance) : account.balance;
}

export function generateSpendChartData(
    transactions: Array<Transaction & { account_category?: string }>,
): (ChartPoint & { label?: string })[] {
    const dailySpends: Record<string, number> = {};

    for (const tx of transactions) {
        // only process debit transactions that are not part of transfers
        if (tx.type !== 'debit' || isTransferTransaction(tx)) {
            continue;
        }

        const isoDate = format(new Date(tx.created_at), 'yyyy-MM-dd');

        if (!dailySpends[isoDate]) {
            dailySpends[isoDate] = 0;
        }

        dailySpends[isoDate] += tx.amount;
    }

    let runningSpend = 0;
    const sortedEntries = Object.entries(dailySpends).sort(
        ([a], [b]) => new Date(a).getTime() - new Date(b).getTime(),
    );

    const chartData = sortedEntries.map(([isoDate, value]) => {
        runningSpend += value;

        return {
            date: format(parseISO(isoDate), 'd MMM yyyy'),
            value: runningSpend,
        };
    });

    return chartData;
}

export function generateNormalizedSpendChartData(
    transactions: Array<Transaction & { account_category?: string }>,
    monthStart: Date,
): (ChartPoint & { label?: string })[] {
    const today = new Date();
    const monthEnd = endOfMonth(monthStart);

    const intervalEnd = isSameMonth(monthStart, today) ? min([today, monthEnd]) : monthEnd;
    const allDays = eachDayOfInterval({ start: monthStart, end: intervalEnd });
    const dailySpends: Record<string, number> = {};

    for (const tx of transactions) {
        if (tx.type !== 'debit' || isTransferTransaction(tx)) continue;

        const isoDate = format(new Date(tx.created_at), 'yyyy-MM-dd');
        if (!dailySpends[isoDate]) {
            dailySpends[isoDate] = 0;
        }
        dailySpends[isoDate] += tx.amount;
    }

    let runningSpend = 0;
    const chartData = allDays.map((day) => {
        const isoDate = format(day, 'yyyy-MM-dd');
        runningSpend += dailySpends[isoDate] || 0;

        return {
            date: format(day, 'd MMM yyyy'),
            value: runningSpend,
        };
    });

    return chartData;
}

export function generateNormalizedSpendChartDataWithMissingDays(
    transactions: Array<Transaction & { account_category?: string }>,
    startDate: Date,
    endDate?: Date,
    initialBalance: number = 0,
): (ChartPoint & { label?: string })[] {
    const today = new Date();
    const finalEndDate =
        endDate ||
        (isSameMonth(startDate, today)
            ? min([today, endOfMonth(startDate)])
            : endOfMonth(startDate));

    const totalDays = Math.ceil(
        (finalEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const transactionsInRange = transactions.filter((tx) => {
        const txDate = new Date(tx.created_at);
        return txDate >= startDate && txDate <= finalEndDate;
    });

    let samplingInterval = 1;
    const maxDataPoints = 20;

    const needsSampling = totalDays > maxDataPoints;

    if (needsSampling) {
        if (totalDays > 365) {
            // For very long periods (over a year), sample by weeks or months
            samplingInterval = Math.max(7, Math.ceil(totalDays / maxDataPoints));
        } else {
            // For shorter periods, sample appropriately
            samplingInterval = Math.ceil(totalDays / maxDataPoints);
        }
    }

    // Generate sampling dates using date-fns for reliable date arithmetic
    const allDays: Date[] = [];
    let currentDate = startDate;
    let dayCount = 0;

    while (currentDate <= finalEndDate) {
        if (dayCount % samplingInterval === 0) {
            allDays.push(new Date(currentDate));
        }
        currentDate = addDays(currentDate, 1);
        dayCount++;
    }

    // Ensure we always include the end date
    if (allDays.length === 0 || allDays[allDays.length - 1].getTime() !== finalEndDate.getTime()) {
        allDays.push(new Date(finalEndDate));
    }

    // Initialize balance changes for each sampling date
    const dailyBalanceChanges: Record<string, number> = {};
    for (const day of allDays) {
        const isoDate = format(day, 'yyyy-MM-dd');
        dailyBalanceChanges[isoDate] = 0;
    }

    // Map each transaction to the closest sampling date
    for (const tx of transactionsInRange) {
        const txDate = new Date(tx.created_at);

        // Find the closest sampling date (the one that comes at or before the transaction date)
        let closestSamplingDate = allDays[0]; // Default to first sampling date

        for (const samplingDate of allDays) {
            if (samplingDate <= txDate) {
                closestSamplingDate = samplingDate;
            } else {
                break; // Stop when we find a sampling date after the transaction
            }
        }

        const isoDate = format(closestSamplingDate, 'yyyy-MM-dd');
        if (tx.type === 'credit') {
            dailyBalanceChanges[isoDate] += tx.amount;
        } else {
            dailyBalanceChanges[isoDate] -= tx.amount;
        }
    }

    // Calculate running balance and format dates appropriately
    let runningBalance = initialBalance;
    const chartData = allDays.map((day) => {
        const isoDate = format(day, 'yyyy-MM-dd');
        runningBalance += dailyBalanceChanges[isoDate];

        // Format date based on sampling interval
        let dateFormat: string;
        if (samplingInterval >= 30) {
            dateFormat = 'MMM yyyy'; // Monthly format for long intervals
        } else if (samplingInterval >= 7) {
            dateFormat = 'd MMM'; // Day and month for weekly intervals
        } else {
            dateFormat = 'd MMM yyyy'; // Full format for daily/short intervals
        }

        return {
            date: format(day, dateFormat),
            value: runningBalance < 0 ? 0 : runningBalance,
        };
    });

    return chartData;
}
