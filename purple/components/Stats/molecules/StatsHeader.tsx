import { View } from '@/components/Shared/styled';
import { useTransactionStore, useTransactions } from '@/components/Transactions/hooks';
import { Transaction } from '@/components/Transactions/schema';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import SpendOverview from './SpendOverview';
import SpendOverviewChart from './SpendOverviewChart';
import TransactionsAccordion from '../../Transactions/molecules/TransactionAccordion';
import StatsHeatmap from './Heatmap';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { GenericAPIResponse } from '@/@types/request';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import SpendOverviewPieChart from './SpendOverviewPieChart';
import SpendOverviewAreaChart from './SpendOverviewAreaChart';
import SpendVsBudgetLineChart from './SpendVsBudgetLineChart';
import CashflowBarChart from './CashflowBarChart';

const now = new Date();
const startDate = startOfMonth(now);
const endDate = endOfMonth(now);

export default function StatsHeader() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const { refetch } = useTransactions({
        requestQuery: {
            page_size: Infinity,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
        },
        options: {
            onSuccess: (response) => {
                const { data } = response as GenericAPIResponse<Transaction[]>;
                setTransactions(data);
            },
        },
    });
    useRefreshOnFocus(refetch);

    return (
        <View className='flex flex-col space-y-5 p-5'>
            {/* Daily Activity Section */}

            <SpendOverview transactions={transactions} />
            <SpendOverviewChart transactions={transactions} />
            <SpendVsBudgetLineChart />
            <SpendOverviewAreaChart />
            <StatsHeatmap transactions={transactions} />

            <View style={{ marginBottom: 200 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        shadowColor: '#A855F7',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.125,
        shadowRadius: 80,
        elevation: 3,
    },
});
