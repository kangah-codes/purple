import { transactionData } from '@/components/Index/constants';
import CustomBottomSheetFlatList from '@/components/Shared/molecules/GlobalBottomSheetFlatList';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import { SafeAreaView, ScrollView, Text, View } from '@/components/Shared/styled';
import TransactionHistoryCard from '@/components/Transactions/molecules/TransactionHistoryCard';
import { Portal } from '@gorhom/portal';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import StatsHeader from '../molecules/StatsHeader';
// import TransactionBreakdownCard from '../molecules/TransactionBreakdownCard';
import { keyExtractor } from '@/lib/utils/number';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { useAuth } from '@/components/Auth/hooks';
import { SessionData } from '@/components/Auth/schema';
import { useMonthlyStats, useStatsStore } from '../hooks';
import { useTransactionStore, useTransactions } from '@/components/Transactions/hooks';
import { groupBy } from '@/lib/utils/helpers';
import { getCurrentMonthYear } from '../utils';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { GenericAPIResponse } from '@/@types/request';
import { Transaction } from '@/components/Transactions/schema';
import SpendOverview from '../molecules/SpendOverview';
import TransactionsAccordion from '../molecules/TransactionAccordion';

const currentMonthYear = getCurrentMonthYear();
const now = new Date();

export default function StatsScreen() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const itemSeparator = useCallback(() => <View className='border-b border-gray-100' />, []);
    const renderBreakdownItem = useCallback(
        ({ item }: { item: any }) => (
            <TransactionBreakdownCard
                data={item}
                // onPress={() => setShowBottomSheetFlatList('statsTransactionBreakdownList', true)}
                // TODO: come back to this
                onPress={() => {}}
            />
        ),
        [],
    );
    const { isStatsLoading, setStats, stats, setIsStatsLoading } = useStatsStore();
    const { sessionData } = useAuth();
    const { isLoading, refetch, isFetching, data } = useTransactions({
        requestQuery: {
            // start_date: startOfMonth(now),
            // end_date: now,
            page_size: 9999999,
        },
        options: {
            onSuccess: (data) => {
                setTransactions((data as GenericAPIResponse<Transaction[]>).data);
            },
        },
    });

    useEffect(() => {
        setIsStatsLoading(isLoading);
    }, [isLoading, data]);

    return (
        <SafeAreaView className='relative h-full bg-white'>
            <ExpoStatusBar style='dark' />
            <ScrollView className='' style={styles.parentView}>
                <View className='flex flex-row items-center justify-between py-2.5 px-5'>
                    <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-lg'>
                        My Stats
                    </Text>
                    <View className='border border-purple-100 px-2 py-1 rounded-full'>
                        <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-xs'>
                            {currentMonthYear}
                        </Text>
                    </View>
                </View>

                <StatsHeader />

                {/* <FlatList
                    contentContainerStyle={styles.flatlist}
                    showsVerticalScrollIndicator={false}
                    data={[]}
                    renderItem={() => <></>}
                    ItemSeparatorComponent={itemSeparator}
                    keyExtractor={keyExtractor}
                    ListHeaderComponent={<StatsHeader />}
                    onRefresh={refetch}
                    refreshing={isFetching}
                /> */}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flatlist: {
        paddingBottom: 100,
    },
    flatlistContentContainer: {
        paddingBottom: 100,
        paddingHorizontal: 20,
        backgroundColor: 'white',
    },
    handleIndicator: {
        backgroundColor: '#D4D4D4',
    },
    container: {
        paddingHorizontal: 20,
    },
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
