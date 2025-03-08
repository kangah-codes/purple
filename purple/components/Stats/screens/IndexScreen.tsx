import { transactionData } from '@/components/Index/constants';
import CustomBottomSheetFlatList from '@/components/Shared/molecules/GlobalBottomSheetFlatList';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import { SafeAreaView, Text, View } from '@/components/Shared/styled';
import TransactionHistoryCard from '@/components/Transactions/molecules/TransactionHistoryCard';
import { Portal } from '@gorhom/portal';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo } from 'react';
import { FlatList, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import StatsHeader from '../molecules/StatsHeader';
import TransactionBreakdownCard from '../molecules/TransactionBreakdownCard';
import { keyExtractor } from '@/lib/utils/number';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { useAuth } from '@/components/Auth/hooks';
import { SessionData } from '@/components/Auth/schema';
import { useMonthlyStats, useStatsStore } from '../hooks';
import { useTransactionStore } from '@/components/Transactions/hooks';
import { groupBy } from '@/lib/utils/helpers';
import { getCurrentMonthYear } from '../utils';

const currentMonthYear = getCurrentMonthYear();

export default function StatsScreen() {
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();
    const { transactions } = useTransactionStore();
    const itemSeparator = useCallback(() => <View className='border-b border-gray-100' />, []);
    const renderItem = useCallback(
        ({ item }: { item: any }) => (
            <TransactionHistoryCard showTitle={false} data={item} onPress={() => {}} />
        ),
        [],
    );
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
    const { isLoading, refetch, isFetching, data } = useMonthlyStats({
        sessionData: sessionData as SessionData,
    });

    const groupedTransactions = useMemo(() => {
        const groupedTransactionsByCategory = groupBy(transactions, 'category');
        const totalAmount = transactions.reduce((acc, curr) => acc + curr.amount, 0);
        const groupedTransactions = Object.keys(groupedTransactionsByCategory).map((category) => {
            const categoryTransactions = groupedTransactionsByCategory[category];
            const categoryTotal = categoryTransactions.reduce((acc, curr) => {
                if (curr.Type === 'debit') {
                    return acc - curr.amount;
                }
                return acc + curr.amount;
            }, 0);
            const categoryPercentage = (categoryTotal / totalAmount) * 100;

            return {
                category,
                percentage: categoryPercentage.toFixed(2),
                amount: categoryTotal.toFixed(2),
                type: categoryTotal >= 0 ? 'credit' : 'debit',
            };
        });

        return groupedTransactions;
    }, [transactions]);

    useEffect(() => {
        setIsStatsLoading(isLoading);

        if (data?.data) {
            setStats(data?.data);
        }
    }, [isLoading, data]);

    return (
        <SafeAreaView className='relative h-full bg-white'>
            <ExpoStatusBar style='dark' />
            {/* <Portal>
                <CustomBottomSheetFlatList
                    snapPoints={['50%', '70%']}
                    children={
                        <View className='px-5 py-2.5'>
                            <Text
                                style={GLOBAL_STYLESHEET.satoshiBlack}
                                className='text-base text-gray-900'
                            >
                                🏠 Housing
                            </Text>
                        </View>
                    }
                    sheetKey={'statsTransactionBreakdownList'}
                    data={transactionData}
                    renderItem={renderItem}
                    containerStyle={styles.container}
                    handleIndicatorStyle={styles.handleIndicator}
                    flatListContentContainerStyle={styles.flatlistContentContainer}
                />
            </Portal> */}

            <View className='' style={styles.parentView}>
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

                <FlatList
                    contentContainerStyle={styles.flatlist}
                    showsVerticalScrollIndicator={false}
                    data={groupedTransactions}
                    renderItem={renderBreakdownItem}
                    ItemSeparatorComponent={itemSeparator}
                    keyExtractor={keyExtractor}
                    ListHeaderComponent={<StatsHeader />}
                    onRefresh={refetch}
                    refreshing={isFetching}
                />
            </View>
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
