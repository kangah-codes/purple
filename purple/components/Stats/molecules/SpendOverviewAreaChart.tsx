import { generateChartData } from '@/components/Accounts/utils';
import { Text, View } from '@/components/Shared/styled';
import { Transaction } from '@/components/Transactions/schema';
import { satoshiFont } from '@/lib/constants/fonts';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { getMaxValue } from '@/lib/utils/object';
import React, { useCallback, useMemo, useState } from 'react';
import { LineChart, PieChart } from 'react-native-gifted-charts';
import { mockTransactions } from '../contants';
import { generateMockTransactionsForMonth } from '../utils';

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

export default function SpendOverviewAreaChart() {
    const { data, data2, maxValue, maxValue2 } = useMemo(() => {
        const transformedData = generateChartData(
            generateMockTransactionsForMonth(new Date(), false),
        );
        const transformedData2 = generateChartData(
            generateMockTransactionsForMonth(new Date(), false),
        );
        return {
            data: transformedData,
            maxValue: getMaxValue(transformedData, 'value', 100),

            data2: transformedData2,
            maxValue2: getMaxValue(transformedData2, 'value', 100),
        };
    }, []);

    const renderYAxisLabel = useCallback((label: string) => {
        const labelVal = Number(label);
        if (labelVal >= 1000000) return (labelVal / 1000000).toFixed(0) + 'M';
        if (labelVal >= 1000) return (labelVal / 1000).toFixed(0) + 'K';
        return label;
    }, []);

    const [width, setWidth] = useState(0);

    const styledData = data.map((item, index) => {
        if (Math.random() > 0.3) {
            return {
                value: 410,
                // labelComponent: () => customLabel('24 Nov'),
                // customDataPoint: customDataPoint,
                // showStrip: true,
                stripHeight: 190,
                stripColor: 'black',
                dataPointLabelComponent: () => {
                    return (
                        <View
                            style={{
                                backgroundColor: 'black',
                                paddingHorizontal: 8,
                                paddingVertical: 5,
                                borderRadius: 4,
                            }}
                        >
                            <Text style={{ color: 'white' }}>410</Text>
                        </View>
                    );
                },
                dataPointLabelShiftY: -70,
                dataPointLabelShiftX: -4,
            };
        }
        return { ...item };
    });

    return (
        <View
            className='px-5 pt-5 mb-5 bg-purple-50 border-[0.5px] border-purple-100 rounded-3xl flex flex-col'
            onLayout={(event) => {
                const { width } = event.nativeEvent.layout;
                setWidth(width);
            }}
        >
            <View className='flex flex-col mb-2.5'>
                <Text className='text-base text-black' style={satoshiFont.satoshiBlack}>
                    This Month vs Last Month
                </Text>
                <View className='flex flex-row space-x-2'>
                    <View className='flex flex-row items-center space-x-1'>
                        <View className='w-2 h-2 rounded-full bg-purple-500' />
                        <Text className='text-purple-500 text-xs' style={satoshiFont.satoshiBold}>
                            This month
                        </Text>
                    </View>
                    <View className='flex flex-row items-center space-x-1'>
                        <View className='w-2 h-2 rounded-full bg-[#737373]' />
                        <Text className='text-[#737373] text-xs' style={satoshiFont.satoshiBold}>
                            Last month
                        </Text>
                    </View>
                </View>
            </View>
            <LineChart
                areaChart
                data={styledData}
                data2={data2}
                rotateLabel
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
