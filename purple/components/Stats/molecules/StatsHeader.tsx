import { View } from '@/components/Shared/styled';
import { useTransactionStore, useTransactions } from '@/components/Transactions/hooks';
import { Transaction } from '@/components/Transactions/schema';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import SpendOverview from './SpendOverview';
import SpendOverviewChart from './SpendOverviewChart';
import TransactionsAccordion from './TransactionAccordion';
import StatsHeatmap from './Heatmap';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { GenericAPIResponse } from '@/@types/request';
import { useRefreshOnFocus } from '@/lib/hooks/refetchOnFocus';

const now = new Date();
const startDate = startOfMonth(now);
const endDate = endOfMonth(now);

export default function StatsHeader() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const { refetch } = useTransactions({
        requestQuery: {
            // TODO: replace this
            page_size: 999_999_999,
            start_date: startDate,
            end_date: endDate,
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
        <View className='flex flex-col space-y-5'>
            {/* Daily Activity Section */}

            <SpendOverview transactions={transactions} />
            <SpendOverviewChart transactions={transactions} />
            <StatsHeatmap transactions={transactions} />
            <TransactionsAccordion transactions={transactions} />

            <View style={{ marginTop: 20 }} />
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
