import { generateChartData, generateSpendChartData } from '@/components/Accounts/utils';
import { Text, View } from '@/components/Shared/styled';
import { mockTransactions } from '@/components/Stats/contants';
import { generateMockTransactionsForMonth } from '@/components/Stats/utils';
import { useTransactions } from '@/components/Transactions/hooks';
import { Transaction } from '@/components/Transactions/schema';
import { satoshiFont } from '@/lib/constants/fonts';
import { getMaxValue } from '@/lib/utils/object';
import { endOfMonth, startOfMonth } from 'date-fns';
import React, { useCallback, useMemo, useState } from 'react';
import { LineChart } from 'react-native-gifted-charts';

type SpendOverviewAreaChartProps = {
    transactions: Transaction[];
};

function groupByCurrency(transactions: Transaction[]) {
    return transactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
        if (!acc[tx.currency]) acc[tx.currency] = [];
        acc[tx.currency].push(tx);
        return acc;
    }, {});
}

function groupByCategory(transactions: Transaction[]) {
    return transactions.reduce<Record<string, { value: number; color: string }>>((acc, tx) => {
        if (tx.type !== 'debit') return acc;
        if (!acc[tx.category]) {
            // Assign a color based on category hash (simple deterministic color)
            const hash = Array.from(tx.category).reduce((a, c) => a + c.charCodeAt(0), 0);
            const color = `hsl(${hash % 360}, 70%, 60%)`;
            acc[tx.category] = { value: 0, color };
        }
        acc[tx.category].value += Math.abs(tx.amount);
        return acc;
    }, {});
}

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

    const { data, data2, maxValue, maxValue2 } = useMemo(() => {
        const transformedData = generateSpendChartData(currentMonthTransactions?.data ?? []);
        const transformedData2 = generateSpendChartData(
            generateMockTransactionsForMonth(new Date()),
        );
        return {
            data: transformedData,
            maxValue: getMaxValue(transformedData, 'value', 100),

            data2: transformedData2,
            maxValue2: getMaxValue(transformedData2, 'value', 100),
        };
    }, [currentMonthTransactions]);

    const renderYAxisLabel = useCallback((label: string) => {
        const labelVal = Number(label);
        if (labelVal >= 1000000) return (labelVal / 1000000).toFixed(0) + 'M';
        if (labelVal >= 1000) return (labelVal / 1000).toFixed(0) + 'K';
        return label;
    }, []);

    const [width, setWidth] = useState(0);

    console.log(Math.max(maxValue, maxValue2), data);

    return (
        <View
            className='px-5 pt-5 pb-2.5 mt-5 bg-purple-50 border-[0.5px] border-purple-100 rounded-3xl flex flex-col'
            onLayout={(event) => {
                const { width } = event.nativeEvent.layout;
                setWidth(width);
            }}
        >
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
                areaChart
                data={data}
                data2={data2}
                // rotateLabel
                maxValue={Math.max(maxValue, maxValue2)}
                hideDataPoints
                // hideRules
                // hideYAxisText
                curvature={0.125}
                curved
                width={300}
                adjustToWidth
                color='#9810fa'
                color2='#737373'
                startFillColor='#9810fa'
                startFillColor2=''
                endFillColor='#7E22CE'
                startOpacity={0.3}
                endOpacity={0}
                initialSpacing={0}
                yAxisColor='white'
                yAxisThickness={0}
                rulesType='solid'
                rulesColor='#F3E8FF'
                disableScroll
                xAxisType='dotted'
                xAxisColor='lightgray'
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
