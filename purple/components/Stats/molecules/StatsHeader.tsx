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
import SpendAreaChart from './SpendAreaChart';

const now = new Date();
const startDate = startOfMonth(now);
const endDate = endOfMonth(now);

export default function StatsHeader() {
    const { refetch, data } = useTransactions({
        requestQuery: {
            page_size: Infinity,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
        },
    });

    useRefreshOnFocus(refetch);

    return (
        <View className='flex flex-col space-y-5 p-5'>
            <SpendOverview transactions={data?.data ?? []} />
            <SpendOverviewChart transactions={data?.data ?? []} />
            <SpendVsBudgetLineChart />
            <SpendAreaChart />
            <CashflowBarChart />
            <StatsHeatmap transactions={data?.data ?? []} />

            <View style={{ marginBottom: 200 }} />
        </View>
    );
}
