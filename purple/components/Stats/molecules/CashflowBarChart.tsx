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

export default memo(
    function CashflowBarChart({
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

        return (
            <View className='p-5 my-5 bg-purple-50 border-[0.5px] border-purple-100 rounded-3xl'>
                <View className='mb-2.5'>
                    <Text className='text-base text-black' style={satoshiFont.satoshiBlack}>
                        Cash Flow
                    </Text>
                    <View className='flex flex-row space-x-2'>
                        <View className='flex flex-row items-center space-x-1'>
                            <View className='w-1.5 h-1.5 rounded-full bg-[#22C55E]' />
                            <Text
                                className='text-[#22C55E] text-xs'
                                style={satoshiFont.satoshiBold}
                            >
                                Inflow
                            </Text>
                        </View>
                        <View className='flex flex-row items-center space-x-1'>
                            <View className='w-1.5 h-1.5 rounded-full bg-[#EF4444]' />
                            <Text
                                className='text-[#EF4444] text-xs'
                                style={satoshiFont.satoshiBold}
                            >
                                Outflow
                            </Text>
                        </View>
                    </View>
                </View>

                <View className='w-full' onLayout={(e) => setChartW(e.nativeEvent.layout.width)}>
                    {chartW > 0 &&
                        rawData.length > 0 &&
                        stackData.length > 0 &&
                        barWidth > 0 &&
                        !isNaN(barWidth) &&
                        !isNaN(spacing) && (
                            <BarChart
                                showLine
                                lineConfig={{
                                    color: '#3f3f46',
                                    thickness: 2,
                                    // curved: true,
                                    // curvature: 0.05,
                                    hideDataPoints: true,
                                    showArrow: true,
                                    arrowConfig: {
                                        fillColor: '#3f3f46',
                                        strokeColor: '#3f3f46',
                                    },
                                    strokeDashArray: [5],
                                }}
                                width={chartW}
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
                                hideRules
                                noOfSections={4}
                                formatYLabel={renderYAxisLabel}
                            />
                        )}
                    {rawData.length === 0 ||
                        (stackData.length === 0 && (
                            <View className='items-center justify-center py-8'>
                                <Text
                                    className='text-purple-500 text-sm'
                                    style={satoshiFont.satoshiBold}
                                >
                                    No transaction data available
                                </Text>
                            </View>
                        ))}
                </View>
            </View>
        );
    },
    (prevProps, nextProps) => {
        // Custom comparison to prevent unnecessary re-renders
        return (
            prevProps.currentDate.getTime() === nextProps.currentDate.getTime() &&
            prevProps.allTransactions.length === nextProps.allTransactions.length &&
            prevProps.oldestTransactionDate?.getTime() ===
                nextProps.oldestTransactionDate?.getTime()
        );
    },
);
