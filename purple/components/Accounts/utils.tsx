import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { formatDateLabel } from '../Plans/utils';
import { Text } from '../Shared/styled';
import { Transaction } from '../Transactions/schema';
import { useAccountStore } from './hooks';
import React from 'react';
import { getKey, groupBy } from '@/lib/utils/helpers';
import { Account } from './schema';

export function createTransactionChartData(
    transactions: Transaction[],
    numberOfLabels: number = 3,
): { date: string; value: number }[] {
    if (transactions.length === 0) {
        return [];
    }

    // Get the oldest and newest dates
    const minDate = new Date(Math.min(...transactions.map((t) => new Date(t.CreatedAt).getTime())));
    const maxDate = new Date(Math.max(...transactions.map((t) => new Date(t.CreatedAt).getTime())));

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
            (t) => new Date(t.CreatedAt).toLocaleDateString() === date,
        );
        acc[date] = transaction ? transaction.amount : 0;
        return acc;
    }, {});

    // Convert the data object to an array of { date, value } objects
    const chartData: { date: string; value: number }[] = [];
    for (let i = transactions.length - 1; i >= 0; i--) {
        const shouldAddLabel = labelIndices.has(i);
        const dateStr = new Date(transactions[i].CreatedAt).toISOString().split('T')[0];
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
    return accounts.find((account) => account.ID === accountID);
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
