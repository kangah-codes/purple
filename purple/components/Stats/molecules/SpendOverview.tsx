import { PieChartSkeleton } from '@/components/Shared/molecules/Skeleton';
import { Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useStatsStore } from '../hooks';
import SpendOverviewPieChart from './SpendOverviewPieChart';

export default function SpendOverview() {
    const {
        stats: { SpendOverview },
        isStatsLoading,
    } = useStatsStore();

    const pieData = useMemo(() => {
        const data = [];
        const spendData = SpendOverview || {};

        for (const currency in spendData) {
            if (Object.prototype.hasOwnProperty.call(spendData, currency)) {
                const { Income, Expense } = spendData[currency];
                data.push({
                    currency,
                    data: [
                        { name: 'Income', value: Income, color: '#16A34A' },
                        { name: 'Expenses', value: Expense, color: '#EF4444' },
                    ],
                });
            }
        }
        return data;
    }, [SpendOverview]);

    if (pieData.length === 0) return null;

    return (
        <View
            className='space-y-5 border border-purple-200 rounded-3xl p-5 bg-white'
            style={styles.card}
        >
            <Text className='text-base text-black' style={GLOBAL_STYLESHEET.satoshiBlack}>
                Spend Overview
            </Text>
            <View className='flex flex-col space-y-5'>
                {isStatsLoading ? (
                    <View className='my-5'>
                        <PieChartSkeleton />
                    </View>
                ) : (
                    pieData.map(({ currency, data }, idx) => (
                        <>
                            <SpendOverviewPieChart currency={currency} data={data} />
                            {idx !== pieData.length - 1 && (
                                <View className='border-b border-purple-100 h-[1] w-full mt-5' />
                            )}
                        </>
                    ))
                )}
            </View>
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
