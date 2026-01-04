import { generateNormalizedSpendChartData } from '@/components/Accounts/utils';
import { Text, View } from '@/components/Shared/styled';
import { useTransactions } from '@/components/Transactions/hooks';
import { satoshiFont } from '@/lib/constants/fonts';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import { endOfMonth, formatISO, startOfMonth, subMonths } from 'date-fns';
import React, { useCallback, useMemo } from 'react';
import { LineChart } from 'react-native-gifted-charts';

type IndexSpendAreaChartProps = {
    startDate: Date;
};

export default function IndexSpendAreaChart({ startDate }: IndexSpendAreaChartProps) {
    const currentMonthStart = startOfMonth(startDate);
    const previousMonthStart = startOfMonth(subMonths(startDate, 1));
    const { data: currentMonthTransactions, refetch } = useTransactions({
        requestQuery: {
            start_date: formatISO(startOfMonth(startDate)),
            end_date: formatISO(endOfMonth(startDate)),
            page_size: Infinity,
            type: 'debit',
        },
    });
    const { data: previousMonthTransactions, refetch: refetchPrevious } = useTransactions({
        requestQuery: {
            start_date: formatISO(startOfMonth(subMonths(startDate, 1))),
            end_date: formatISO(endOfMonth(subMonths(startDate, 1))),
            page_size: Infinity,
            type: 'debit',
        },
    });

    const { currentData, previousData, globalMaxValue } = useMemo(() => {
        const currentMonthData = generateNormalizedSpendChartData(
            currentMonthTransactions?.data ?? [],
            currentMonthStart,
        );

        const previousMonthData = generateNormalizedSpendChartData(
            previousMonthTransactions?.data ?? [],
            previousMonthStart,
        );

        const previousMonthLength = Math.max(
            previousMonthData.length,
            new Date(
                previousMonthStart.getFullYear(),
                previousMonthStart.getMonth() + 1,
                0,
            ).getDate(),
        );

        while (previousMonthData.length < previousMonthLength) {
            const lastValue = previousMonthData[previousMonthData.length - 1]?.value ?? 0;
            previousMonthData.push({
                date: `Day ${previousMonthData.length + 1}`,
                value: lastValue,
            });
        }

        const currentMax = Math.max(...currentMonthData.map((d) => d.value));
        const previousMax = Math.max(...previousMonthData.map((d) => d.value));
        const globalMax = Math.max(currentMax, previousMax, 100);

        return {
            currentData: currentMonthData,
            previousData: previousMonthData,
            globalMaxValue: globalMax,
        };
    }, [currentMonthTransactions, previousMonthTransactions]);

    const renderYAxisLabel = useCallback((label: string) => {
        const labelVal = Number(label);
        if (labelVal >= 1000000) return (labelVal / 1000000).toFixed(0) + 'M';
        if (labelVal >= 1000) return (labelVal / 1000).toFixed(0) + 'K';
        return labelVal.toFixed(0);
    }, []);

    useRefreshOnFocus(refetch);
    useRefreshOnFocus(refetchPrevious);

    return (
        <View className='flex flex-col pt-5'>
            <View className='flex flex-col mb-2.5'>
                <Text className='text-base text-black' style={satoshiFont.satoshiBlack}>
                    Spending
                </Text>
                <View className='flex flex-row space-x-2'>
                    <View className='flex flex-row items-center space-x-1'>
                        <View className='w-1.5 h-1.5 rounded-full bg-purple-500' />
                        <Text className='text-purple-500 text-xs' style={satoshiFont.satoshiBold}>
                            This month
                        </Text>
                    </View>
                    <View className='flex flex-row items-center space-x-1'>
                        <View className='w-1.5 h-1.5 rounded-full bg-[#737373]' />
                        <Text className='text-[#737373] text-xs' style={satoshiFont.satoshiBold}>
                            Last month
                        </Text>
                    </View>
                </View>
            </View>
            <View className='-mb-4'>
                <LineChart
                    data={previousData}
                    data2={currentData}
                    maxValue={globalMaxValue}
                    hideDataPoints
                    width={300}
                    adjustToWidth
                    color='#737373'
                    color2='#9810fa'
                    initialSpacing={0}
                    yAxisColor='white'
                    yAxisThickness={0}
                    rulesType='dotted'
                    rulesColor='#e9d4ff'
                    disableScroll
                    xAxisType='dotted'
                    xAxisColor='#e9d4ff'
                    xAxisThickness={2}
                    dashWidth={4}
                    dashGap={4}
                    yAxisTextStyle={{
                        fontSize: 12,
                        fontFamily: 'SatoshiBlack',
                    }}
                    noOfSections={4}
                    formatYLabel={renderYAxisLabel}
                />
            </View>
        </View>
    );
}
