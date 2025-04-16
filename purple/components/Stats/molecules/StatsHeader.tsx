import { View } from '@/components/Shared/styled';
import { useTransactionStore } from '@/components/Transactions/hooks';
import { Transaction } from '@/components/Transactions/schema';
import React from 'react';
import { StyleSheet } from 'react-native';
import SpendOverview from './SpendOverview';
import SpendOverviewChart from './SpendOverviewChart';
import TransactionsAccordion from './TransactionAccordion';

type StatsHeaderProps = {
    transactions: Transaction[];
};
export default function StatsHeader() {
    const { transactions } = useTransactionStore();
    return (
        <View className='flex flex-col space-y-5'>
            {/* Daily Activity Section */}
            {/* <StatsHeatmap /> */}

            <SpendOverview />
            <SpendOverviewChart />
            <TransactionsAccordion transactions={transactions} />

            {/* <View>
                <TransactionsAccordion transactions={transactions} />
            </View> */}

            {/* Spend Overview Section */}
            {/* <View>
                <SpendOverview />
            </View> */}

            {/* Savings Overview Section */}
            {/* <View>
                    <MonthSavings />
                </View> */}

            {/* Spend Overview Section */}

            {/* <View className='space-y-5 border border-purple-200 rounded-3xl px-5 pt-5'>
                    <Text className='text-sm text-black' style={GLOBAL_STYLESHEET.satoshiBlack}>
                        Spend Trend
                    </Text>

                    <View className=''>
                        <SpendTrendAreaChart />
                    </View>
                </View> */}

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
