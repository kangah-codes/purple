/* eslint-disable @typescript-eslint/no-unused-vars */
import { Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { Transaction } from '@/components/Transactions/schema';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { BarChart } from 'react-native-gifted-charts';
import { format, startOfMonth, eachMonthOfInterval, isSameMonth, subMonths } from 'date-fns';

interface CashflowBarChartProps {
    currentDate: Date;
    allTransactions: Transaction[];
    oldestTransactionDate?: Date;
}

// TODO: figure out how to properly scale chart when we start seeing sufficiently large inflows/outflows
export default memo(function CashflowBarChart({
    currentDate,
    allTransactions,
    oldestTransactionDate,
}: CashflowBarChartProps) {
    console.log('CashflowBarChart rendering for:', format(currentDate, 'MMM yyyy'));
    const [chartW, setChartW] = useState(0);
    const stableTransactions = useMemo(
        () => allTransactions,
        [allTransactions.length, allTransactions],
    );
    const rawData = useMemo(() => {
        if (stableTransactions.length === 0) {
            return [];
        }

        const endMonth = currentDate;
        const startMonth = subMonths(startOfMonth(currentDate), 6);
        const effectiveStartMonth = oldestTransactionDate
            ? startOfMonth(oldestTransactionDate) > startMonth
                ? startOfMonth(oldestTransactionDate)
                : startMonth
            : startMonth;
        const allMonths = eachMonthOfInterval({ start: effectiveStartMonth, end: endMonth });
        const result = allMonths.map((month) => {
            const monthTransactions = stableTransactions.filter((transaction) => {
                const transactionDate = new Date(transaction.created_at);
                return isSameMonth(transactionDate, month);
            });

            const inflow = monthTransactions
                .filter((t) => t.type === 'credit')
                .reduce((sum, t) => sum + Number(t.amount), 0);

            const outflow = monthTransactions
                .filter((t) => t.type === 'debit')
                .reduce((sum, t) => sum - Math.abs(Number(t.amount)), 0);

            return {
                label: format(month, 'MMM'),
                inflow,
                outflow,
            };
        });

        return result;
    }, [currentDate, oldestTransactionDate, stableTransactions]);

    const stackData = rawData
        .map((item) => ({
            label: item.label,
            stacks: [
                ...(item.outflow < 0 ? [{ value: item.outflow, color: '#EF4444' }] : []),
                ...(item.inflow > 0 ? [{ value: item.inflow, color: '#22C55E' }] : []),
            ],
        }))
        .filter((item) => item.stacks.length > 0);

    // Check if chart has both inflow and outflow data to prevent memory errors
    const hasInflowData = stackData.some((item) =>
        item.stacks.some((stack) => stack.color === '#22C55E'),
    );
    const hasOutflowData = stackData.some((item) =>
        item.stacks.some((stack) => stack.color === '#EF4444'),
    );
    const isValidChart = hasInflowData && hasOutflowData;

    // TODO: pull into reusable util
    const renderYAxisLabel = useCallback((label: string) => {
        const labelVal = Number(label);
        const labelAbs = Math.abs(labelVal);
        if (labelAbs >= 1000000) return `${(labelVal / 1000000).toFixed(0)}M`;
        if (labelAbs >= 1000) return `${(labelVal / 1000).toFixed(0)}K`;
        return labelVal.toFixed(0);
    }, []);

    const { barWidth, spacing } = useMemo(() => {
        const n = stackData.length || 1;
        const minSpacing = 8;
        if (chartW <= 0) return { barWidth: 0, spacing: 0 };

        const yAxisLabelWidth = 40;
        const availableW = chartW - yAxisLabelWidth;

        const bw = Math.max(2, Math.floor((availableW - (n - 1) * minSpacing) / n));
        const sp = n > 1 ? Math.max(0, Math.floor((availableW - n * bw) / (n - 1))) : 0;

        return { barWidth: bw, spacing: sp };
    }, [chartW, stackData.length]);
    const { maxValue, minValue } = useMemo(() => {
        if (rawData.length === 0) return { maxValue: 0, minValue: 0 };
        const maxInflow = Math.max(...rawData.map((d) => d.inflow));
        const maxOutflow = Math.min(...rawData.map((d) => d.outflow));
        return { maxValue: maxInflow, minValue: maxOutflow };
    }, [rawData]);

    const chartHeight = useMemo(() => {
        const numberOfBars = stackData.length;
        const valueRange = maxValue - minValue;
        const baseHeight = chartW / 2;
        // scale based on number of bars fewer bars = shorter chart
        const barCountMultiplier =
            numberOfBars === 1 ? 0.5 : Math.max(0.6, Math.min(1.2, numberOfBars / 6));
        // scale based on value range larger needs more height
        let valueRangeMultiplier = 1;
        if (valueRange > 100000) {
            valueRangeMultiplier = 0.8;
        } else if (valueRange > 10000) {
            valueRangeMultiplier = 0.9;
        }

        const calculatedHeight = baseHeight * barCountMultiplier * valueRangeMultiplier;

        return Math.max(120, Math.min(300, calculatedHeight));
    }, [chartW, stackData.length, maxValue, minValue]);

    const stepValue = useMemo(() => {
        const range = maxValue - minValue;
        const sections = 3;

        if (range === 0) return 1;

        const rawStep = range / sections;
        // find order of magnitude
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const normalized = rawStep / magnitude;

        let niceNormalized;
        if (normalized <= 1) niceNormalized = 1;
        else if (normalized <= 2) niceNormalized = 2;
        else if (normalized <= 5) niceNormalized = 5;
        else niceNormalized = 10;

        return niceNormalized * magnitude;
    }, [maxValue, minValue]);

    return (
        <View className='p-5 my-5 bg-purple-50 border-[0.5px] border-purple-100 rounded-3xl'>
            <View className='mb-2.5'>
                <Text className='text-base text-black' style={satoshiFont.satoshiBlack}>
                    Cash Flow
                </Text>
                <View className='flex flex-row space-x-2'>
                    <View className='flex flex-row items-center space-x-1'>
                        <View className='w-1.5 h-1.5 rounded-full bg-[#22C55E]' />
                        <Text className='text-[#22C55E] text-xs' style={satoshiFont.satoshiBold}>
                            Inflow
                        </Text>
                    </View>
                    <View className='flex flex-row items-center space-x-1'>
                        <View className='w-1.5 h-1.5 rounded-full bg-[#EF4444]' />
                        <Text className='text-[#EF4444] text-xs' style={satoshiFont.satoshiBold}>
                            Outflow
                        </Text>
                    </View>
                </View>
            </View>

            <View className='w-full' onLayout={(e) => setChartW(e.nativeEvent.layout.width)}>
                {chartW > 0 &&
                    rawData.length > 0 &&
                    stackData.length > 1 &&
                    isValidChart &&
                    barWidth > 0 &&
                    !isNaN(barWidth) &&
                    !isNaN(spacing) && (
                        <BarChart
                            showLine
                            lineConfig={{
                                color: '#3f3f46',
                                thickness: 2,
                                hideDataPoints: true,
                                showArrow: true,
                                arrowConfig: {
                                    fillColor: '#3f3f46',
                                    strokeColor: '#3f3f46',
                                },
                                strokeDashArray: [5],
                            }}
                            width={chartW}
                            height={chartHeight}
                            // yAxisExtraHeight={}
                            // stepValue={stepValue / 2}
                            // stepHeight={10 * Math.log10(stepValue)}
                            // noOfSectionsBelowXAxis={5}
                            stackData={stackData}
                            disableScroll
                            initialSpacing={0}
                            endSpacing={0}
                            spacing={spacing}
                            barWidth={barWidth}
                            yAxisLabelWidth={40}
                            yAxisColor='white'
                            xAxisColor='white'
                            yAxisThickness={0}
                            xAxisThickness={0}
                            xAxisLabelsAtBottom
                            yAxisTextStyle={{ fontSize: 12, fontFamily: 'SatoshiBlack' }}
                            xAxisLabelTextStyle={{
                                fontSize: 12,
                                fontFamily: 'SatoshiBlack',
                                marginLeft: 'auto',
                                marginRight: 'auto',
                            }}
                            noOfSections={3}
                            formatYLabel={renderYAxisLabel}
                            maxValue={maxValue}
                            mostNegativeValue={minValue}
                            rulesType='dotted'
                            rulesColor='#e9d4ff'
                            xAxisType='dotted'
                            dashWidth={4}
                            dashGap={4}
                            hideRules
                        />
                    )}
                {(rawData.length === 0 || stackData.length < 2 || !isValidChart) && (
                    <View className='items-center justify-center py-8'>
                        <Text
                            className='text-purple-500 text-sm text-center'
                            style={satoshiFont.satoshiBold}
                        >
                            Not enough data available
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
});
