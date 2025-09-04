import { generateChartData } from '@/components/Accounts/utils';
import { Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { getMaxValue } from '@/lib/utils/object';
import React, { useCallback, useMemo, useState } from 'react';
import { LineChart } from 'react-native-gifted-charts';
import { generateMockTransactionsForMonth, generateNormalizedSpendChartData } from '../utils';
import { startOfMonth } from 'date-fns';

export default function SpendVsBudgetLineChart() {
    const { data, data2, globalMax } = useMemo(() => {
        const transformedData = generateNormalizedSpendChartData(
            generateMockTransactionsForMonth(new Date(), true, true),
            startOfMonth(new Date()),
        );
        const transformedData2 = generateNormalizedSpendChartData(
            generateMockTransactionsForMonth(new Date(), true, true),
            startOfMonth(new Date()),
        );

        const currentMax = Math.max(...transformedData.map((d) => d.value));
        const previousMax = Math.max(...transformedData.map((d) => d.value));
        const globalMax = Math.max(currentMax, previousMax, 100);

        return {
            data: transformedData,
            data2: transformedData2,
            globalMax,
        };
    }, []);

    const renderYAxisLabel = useCallback((label: string) => {
        const labelVal = Number(label);
        if (labelVal >= 1000000) return (labelVal / 1000000).toFixed(0) + 'M';
        if (labelVal >= 1000) return (labelVal / 1000).toFixed(0) + 'K';
        return label;
    }, []);

    console.log(data, data2);

    return (
        <View className='px-5 pt-5 pb-2.5 mb-5 bg-purple-50 border-[0.5px] border-purple-100 rounded-3xl flex flex-col'>
            <View className='flex flex-col mb-2.5'>
                <Text className='text-base text-black' style={satoshiFont.satoshiBlack}>
                    Spending vs Budget
                </Text>
                <View className='flex flex-row space-x-2'>
                    <View className='flex flex-row items-center space-x-1'>
                        <View className='w-1.5 h-1.5 rounded-full bg-purple-500' />
                        <Text className='text-purple-500 text-xs' style={satoshiFont.satoshiBold}>
                            Spend
                        </Text>
                    </View>
                    <View className='flex flex-row items-center space-x-1'>
                        <View className='w-1.5 h-1.5 rounded-full bg-[#737373]' />
                        <Text className='text-[#737373] text-xs' style={satoshiFont.satoshiBold}>
                            Budget
                        </Text>
                    </View>
                </View>
            </View>
            <LineChart
                // areaChart
                data={data}
                data2={data2}
                rotateLabel
                maxValue={globalMax}
                hideDataPoints
                // hideRules
                // hideYAxisText
                // curvature={0.125}
                // curved
                width={300}
                adjustToWidth
                color='#9810fa'
                color2='#737373'
                startOpacity={0.5}
                endOpacity={0.1}
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
                noOfSections={4}
                formatYLabel={renderYAxisLabel}
            />
        </View>
    );
}
