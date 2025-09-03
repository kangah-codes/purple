import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { groupBy } from '@/lib/utils/helpers';
import { format, parseISO } from 'date-fns';
import React from 'react';
import { formatDateLabel } from '../Plans/utils';
import { Text } from '../Shared/styled';
import { Transaction } from '../Transactions/schema';
import { useAccountStore } from './hooks';
import { Account, TimePeriod } from './schema';
import { satoshiFont } from '@/lib/constants/fonts';

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
    let currentDate = new Date(minDate);
    while (currentDate <= maxDate) {
        allDates.push(currentDate.toLocaleDateString());
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aggregate the transaction data
    const data = allDates.reduce<{ [key: string]: number }>((acc, date) => {
        const transaction = transactions.find(
            (t) => new Date(t.created_at).toLocaleDateString() === date,
        );
        acc[date] = transaction ? transaction.amount : 0;
        return acc;
    }, {});

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

export function useGetAccountFromStore(accountID: string) {
    const { accounts } = useAccountStore();
    return accounts.find((account) => account.id === accountID);
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
    labelSpacing: number = 1,
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

    const chartData = sortedEntries.map(([isoDate, value], idx) => {
        runningBalance += value;
        const showLabel = labelSpacing > 0 && idx % labelSpacing === 0;
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
    labelSpacing: number = 1,
): (ChartPoint & { label?: string })[] {
    const dailySpends: Record<string, number> = {};

    for (const tx of transactions) {
        // only process debit transactions
        if (tx.type !== 'debit') {
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

    const chartData = sortedEntries.map(([isoDate, value], idx) => {
        runningSpend += value;
        const showLabel = labelSpacing > 0 && idx % labelSpacing === 0;
        return {
            date: format(parseISO(isoDate), 'd MMM yyyy'),
            value: runningSpend,
            ...(showLabel && {
                labelComponent: () => (
                    <Text style={satoshiFont.satoshiBold} className='text-xs'>
                        {format(parseISO(isoDate), 'd MMM')}
                    </Text>
                ),
            }),
        };
    });

    return chartData;
}
