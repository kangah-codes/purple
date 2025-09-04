import { generateSpendChartData } from '@/components/Accounts/utils';
import { Text, View } from '@/components/Shared/styled';
import { useTransactions } from '@/components/Transactions/hooks';
import { satoshiFont } from '@/lib/constants/fonts';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import { getMaxValue } from '@/lib/utils/object';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import React, { useCallback, useMemo } from 'react';
import { LineChart } from 'react-native-gifted-charts';

const now = new Date();

export default function SpendAreaChart() {
    const { data: currentMonthTransactions, refetch } = useTransactions({
        requestQuery: {
            start_date: startOfMonth(now).toISOString(),
            end_date: endOfMonth(now).toISOString(),
            page_size: Infinity,
            type: 'debit',
        },
    });
    const { data: previousMonthTransactions, refetch: refetchPrevious } = useTransactions({
        requestQuery: {
            start_date: startOfMonth(subMonths(now, 1)).toISOString(),
            end_date: endOfMonth(subMonths(now, 1)).toISOString(),
            page_size: Infinity,
            type: 'debit',
        },
    });

    const { data, data2, maxValue, maxValue2 } = useMemo(() => {
        const transformedData = generateSpendChartData(currentMonthTransactions?.data ?? []);
        const transformedData2 = generateSpendChartData(previousMonthTransactions?.data ?? []);
        return {
            data: transformedData,
            maxValue: getMaxValue(transformedData, 'value', 100),

            data2: transformedData2,
            maxValue2: getMaxValue(transformedData2, 'value', 100),
        };
    }, [currentMonthTransactions, previousMonthTransactions]);

    const renderYAxisLabel = useCallback((label: string) => {
        const labelVal = Number(label);
        if (labelVal >= 1000000) return (labelVal / 1000000).toFixed(0) + 'M';
        if (labelVal >= 1000) return (labelVal / 1000).toFixed(0) + 'K';
        return label;
    }, []);

    useRefreshOnFocus(refetch);
    useRefreshOnFocus(refetchPrevious);

    console.log(data2, Math.max(maxValue, maxValue2));

    return (
        <View className='px-5 pt-5 pb-2.5 mt-5 bg-purple-50 border-[0.5px] border-purple-100 rounded-3xl flex flex-col'>
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
            <LineChart
                // areaChart
                data={data}
                data2={data2}
                // rotateLabel
                maxValue={Math.max(maxValue, maxValue2)}
                hideDataPoints
                // hideRules
                // hideYAxisText
                // curvature={0.125}
                // curved
                width={300}
                adjustToWidth
                color='#9810fa'
                color2='#737373'
                startFillColor='#9810fa'
                startFillColor2=''
                endFillColor2='#7E22CE'
                startOpacity={0.3}
                endOpacity={0}
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
                xAxisLabelTextStyle={{
                    fontSize: 12,
                    fontFamily: 'SatoshiBlack',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                }}
                noOfSections={5}
                formatYLabel={renderYAxisLabel}
            />
        </View>
    );
}
