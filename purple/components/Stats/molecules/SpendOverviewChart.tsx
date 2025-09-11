import { Text, View } from '@/components/Shared/styled';
import { Transaction } from '@/components/Transactions/schema';
import { satoshiFont } from '@/lib/constants/fonts';
import React, { useCallback, useMemo } from 'react';
import { BarChart } from 'react-native-gifted-charts';
import { getStackedChartData, getWeekRangesForMonth } from '../utils';
import WeekLegend from './SpendOverviewLegend';

type SpendOverviewChartProps = {
    transactions: Transaction[];
};

export default function SpendOverviewChart({ transactions }: SpendOverviewChartProps) {
    const { stackData, weekRanges } = useMemo(() => {
        return {
            stackData: getStackedChartData(transactions),
            weekRanges: getWeekRangesForMonth(new Date()),
        };
    }, [transactions]);
    const renderYAxisLabel = useCallback((label: string) => {
        const labelVal = Number(label);
        if (labelVal >= 1000000) return (labelVal / 1000000).toFixed(0) + 'M';
        if (labelVal >= 1000) return (labelVal / 1000).toFixed(0) + 'K';
        return label;
    }, []);

    return (
        <View className='flex-col space-y-2.5 p-5 my-5 bg-purple-50 border-[0.5px] border-purple-100 rounded-3xl'>
            <Text className='text-base text-black' style={satoshiFont.satoshiBlack}>
                Spend By Week
            </Text>
            <View className='mb-5'>
                <BarChart
                    adjustToWidth
                    height={250}
                    barWidth={40}
                    spacing={5}
                    noOfSections={2}
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
            <WeekLegend weekRanges={weekRanges} />
        </View>
    );
}
