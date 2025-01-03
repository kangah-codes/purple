import { PieChart } from 'react-native-gifted-charts';
import { View, Text } from '@/components/Shared/styled';
import { memo, useCallback, useMemo } from 'react';
import React from 'react';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { useAccountStore } from '@/components/Accounts/hooks';
import { usePlanStore } from '../hooks';
import { getAccountTransactionStats } from '../utils';
import { FlashList } from '@shopify/flash-list';
import { keyExtractor } from '@/lib/utils/number';
import PlanAccountDeductionCard from './PlanAccountDeductionCard';
import { PlanAccountPieChartStats } from '../schema';

function PlanAccountOverviewPieChart() {
    const { accounts } = useAccountStore();
    const { currentPlan } = usePlanStore();

    const accountStats = useMemo(
        () => getAccountTransactionStats(currentPlan?.Transactions, accounts),
        [accounts, currentPlan],
    );
    const centerLabelComponent = useCallback(() => {
        const highestValue = accountStats.reduce((acc, curr) => Math.max(acc, curr.amount), 0);
        const total = accountStats.reduce((acc, curr) => acc + curr.amount, 0);

        return (
            <Text style={GLOBAL_STYLESHEET.gramatikaBlackItalic} className='text-3xl'>
                {Math.round((highestValue / total) * 100) + '%'}
            </Text>
        );
    }, []);
    const renderItem = useCallback(
        ({ item }: { item: PlanAccountPieChartStats }) => <PlanAccountDeductionCard data={item} />,
        [currentPlan],
    );
    const renderItemSeparator = useCallback(
        () => <View className='border-b border-purple-100' />,
        [],
    );

    if (accountStats.length == 0) return null;

    return (
        <View className='flex flex-col px-5 space-y-2.5'>
            <View className='flex flex-row w-full justify-between items-center'>
                <Text style={GLOBAL_STYLESHEET.gramatikaBlack} className='text-lg text-black'>
                    Account Deductions
                </Text>
            </View>
            <View className='flex items-center justify-center flex-row space-x-5 h-[160] px-5 w-full'>
                <PieChart
                    donut
                    radius={80}
                    innerRadius={60}
                    data={accountStats}
                    centerLabelComponent={centerLabelComponent}
                    showGradient
                />
            </View>
            <FlashList
                estimatedItemSize={40}
                data={accountStats}
                keyExtractor={keyExtractor}
                // contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                ItemSeparatorComponent={renderItemSeparator}
                onEndReachedThreshold={0.5}
                scrollEnabled={false}
            />
        </View>
    );
}

export default memo(PlanAccountOverviewPieChart);
