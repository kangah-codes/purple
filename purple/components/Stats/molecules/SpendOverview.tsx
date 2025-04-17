import { PieChartSkeleton } from '@/components/Shared/molecules/Skeleton';
import { Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useStatsStore } from '../hooks';
import SpendOverviewPieChart from './SpendOverviewPieChart';
import { formatCurrencyRounded } from '@/lib/utils/number';

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

    return (
        <View className='flex flex-col px-5'>
            <View className='flex flex-row space-x-2.5'>
                <View className='flex-1 flex-col p-5 bg-purple-50 rounded-3xl'>
                    <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-xs text-purple-400'>
                        Total Income
                    </Text>
                    <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-xl text-black'>
                        {formatCurrencyRounded(9994, 'USD')}
                    </Text>
                </View>

                <View className='flex-1 flex-col p-5 bg-purple-50 rounded-3xl'>
                    <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-xs text-purple-400'>
                        Total Expenses
                    </Text>
                    <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-xl text-black'>
                        {formatCurrencyRounded(9994, 'USD')}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {},
});
