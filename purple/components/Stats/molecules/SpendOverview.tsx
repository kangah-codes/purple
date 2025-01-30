import { View } from '@/components/Shared/styled';
import React, { memo } from 'react';
import { useStatsStore } from '../hooks';
import SpendOverviewPieChart from './SpendOverviewPieChart';
import { PieChartSkeleton } from '@/components/Shared/molecules/Skeleton';

export default function SpendOverview() {
    const {
        stats: { SpendOverview },
        isStatsLoading,
    } = useStatsStore();

    const pieData = Object.entries(SpendOverview ?? {}).map(([currency, data]) => ({
        currency,
        data: [
            { name: 'Income', value: data.Income, color: '#16A34A' },
            { name: 'Expenses', value: data.Expense, color: '#EF4444' },
        ],
    }));

    return (
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
    );
}
