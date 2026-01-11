import { Text, View } from '@/components/Shared/styled';
import { Transaction } from '@/components/Transactions/schema';
import { satoshiFont } from '@/lib/constants/fonts';
import React, { useCallback, useMemo } from 'react';
import { BarChart } from 'react-native-gifted-charts';
import { getStackedChartData, getWeekRangesForMonth } from '../utils';
import WeekLegend from './SpendOverviewLegend';

type SpendOverviewChartProps = {
    transactions: Transaction[];
    startDate: Date;
};

export default function SpendOverviewChart({ transactions, startDate }: SpendOverviewChartProps) {
    const { stackData, weekRanges, maxValue } = useMemo(() => {
        const stackData = getStackedChartData(transactions, startDate);
        return {
            stackData,
            weekRanges: getWeekRangesForMonth(startDate),
            maxValue: Math.max(
                ...stackData.map((item) => item.stacks.reduce((a, b) => a + b.value, 0)),
                1,
            ),
        };
    }, [transactions, startDate]);
    const renderYAxisLabel = useCallback((label: string) => {
        const labelVal = Number(label);
        if (labelVal >= 1000000) return (labelVal / 1000000).toFixed(0) + 'M';
        if (labelVal >= 1000) return (labelVal / 1000).toFixed(0) + 'K';
        return labelVal.toFixed(0);
    }, []);

    return (
        <View className='flex-col space-y-2.5 pt-5 pb-2.5 my-5 bg-purple-50 border-[0.5px] border-purple-100 rounded-3xl'>
            <View className='flex flex-col mb-2.5 px-5'>
                <Text className='text-base text-black' style={satoshiFont.satoshiBlack}>
                    Spend By Week
                </Text>
                <Text className='text-purple-500 text-xs' style={satoshiFont.satoshiBold}>
                    Overview of your weekly spend
                </Text>
            </View>
            <View className='mb-2.5 px-2.5'>
                <BarChart
                    adjustToWidth
                    height={250}
                    barWidth={40}
                    spacing={5}
                    noOfSections={3}
                    stepValue={Math.ceil(maxValue / 3)}
                    maxValue={maxValue}
                    barBorderRadius={9}
                    stackData={stackData}
                    yAxisThickness={0}
                    xAxisThickness={0}
                    yAxisTextStyle={{
                        fontSize: 12,
                        fontFamily: 'SatoshiBlack',
                    }}
                    xAxisLabelTextStyle={{
                        fontSize: 12,
                        fontFamily: 'SatoshiBlack',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }}
                    hideRules
                    formatYLabel={renderYAxisLabel}
                />
            </View>
            <View className='px-5'>
                <WeekLegend weekRanges={weekRanges} />
            </View>
        </View>
    );
}
