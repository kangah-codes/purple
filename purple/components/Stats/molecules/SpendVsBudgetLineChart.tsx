import { Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import React, { useCallback, useMemo } from 'react';
import { LineChart } from 'react-native-gifted-charts';
import { generateNormalizedSpendChartData } from '../utils';
import { endOfMonth, getDaysInMonth, startOfMonth } from 'date-fns';
import { useTransactions } from '@/components/Transactions/hooks';
import { useBudgetForMonth } from '@/components/Plans/hooks';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import { formatCurrencyRounded } from '@/lib/utils/number';

type SpendVsBudgetLineChartProps = {
    startDate: Date;
};

export default function SpendVsBudgetLineChart({ startDate }: SpendVsBudgetLineChartProps) {
    const monthStart = startOfMonth(startDate);
    const monthNumber = startDate.getMonth() + 1;
    const year = startDate.getFullYear();

    // Fetch actual transactions for the month
    const { data: transactionsData, refetch } = useTransactions({
        requestQuery: {
            start_date: startOfMonth(startDate).toISOString(),
            end_date: endOfMonth(startDate).toISOString(),
            page_size: Infinity,
            type: 'debit',
        },
    });

    // Fetch budget for the month
    const { data: budgetData, refetch: refetchBudget } = useBudgetForMonth(monthNumber, year);
    const budget = budgetData?.data;

    const { spendData, budgetLineData, globalMax, totalBudget, totalSpent } = useMemo(() => {
        const transactions = transactionsData?.data ?? [];
        const daysInMonth = getDaysInMonth(startDate);

        // Generate actual spend data (cumulative)
        const actualSpendData = generateNormalizedSpendChartData(transactions, monthStart);

        // Get total budget allocated
        const budgetAllocated = budget?.summary?.total_allocated ?? 0;
        const dailyBudgetRate = budgetAllocated / daysInMonth;

        // Generate budget line data (linear progression to total budget)
        // This shows the "ideal" spending pace to stay within budget
        const budgetLine = Array.from({ length: daysInMonth }, (_, i) => ({
            value: dailyBudgetRate * (i + 1),
            date: `Day ${i + 1}`,
        }));

        // Calculate total spent so far
        const currentSpent = actualSpendData.length > 0 
            ? actualSpendData[actualSpendData.length - 1].value 
            : 0;

        // Determine max value for chart scaling
        const spendMax = Math.max(...actualSpendData.map((d) => d.value), 0);
        const maxBudget = budgetAllocated;
        const globalMaxValue = Math.max(spendMax, maxBudget, 100) * 1.1; // Add 10% padding

        return {
            spendData: actualSpendData,
            budgetLineData: budgetLine,
            globalMax: globalMaxValue,
            totalBudget: budgetAllocated,
            totalSpent: currentSpent,
        };
    }, [transactionsData, budget, startDate, monthStart]);

    const renderYAxisLabel = useCallback((label: string) => {
        const labelVal = Number(label);
        if (labelVal >= 1000000) return (labelVal / 1000000).toFixed(0) + 'M';
        if (labelVal >= 1000) return (labelVal / 1000).toFixed(0) + 'K';
        return labelVal.toFixed(0);
    }, []);

    useRefreshOnFocus(refetch);
    useRefreshOnFocus(refetchBudget);

    // Don't render if there's no budget set
    if (!budget) {
        return (
            <View className='px-5 pt-5 pb-5 mt-5 bg-purple-50 border-[0.5px] border-purple-100 rounded-3xl flex flex-col'>
                <Text className='text-base text-black' style={satoshiFont.satoshiBlack}>
                    Spending vs Budget
                </Text>
                <Text className='text-xs text-purple-500 mt-2' style={satoshiFont.satoshiBold}>
                    No budget set for this month
                </Text>
            </View>
        );
    }

    const remainingBudget = totalBudget - totalSpent;
    const isOverBudget = remainingBudget < 0;
    const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return (
        <View className='px-5 pt-5 pb-2.5 mt-5 bg-purple-50 border-[0.5px] border-purple-100 rounded-3xl flex flex-col'>
            <View className='flex flex-col mb-2.5'>
                <Text className='text-base text-black' style={satoshiFont.satoshiBlack}>
                    Spending vs Budget
                </Text>
                <View className='flex flex-row space-x-2'>
                    <View className='flex flex-row items-center space-x-1'>
                        <View className='w-1.5 h-1.5 rounded-full bg-purple-500' />
                        <Text className='text-purple-500 text-xs' style={satoshiFont.satoshiBold}>
                            Actual
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

            {/* Summary Stats */}
            <View className='flex flex-row justify-between mb-4 px-1'>
                <View className='flex flex-col items-center'>
                    <Text className='text-xs text-purple-500' style={satoshiFont.satoshiBold}>
                        Spent
                    </Text>
                    <Text className='text-sm text-black' style={satoshiFont.satoshiBlack}>
                        {formatCurrencyRounded(totalSpent, budget.currency)}
                    </Text>
                </View>
                <View className='flex flex-col items-center'>
                    <Text className='text-xs text-purple-500' style={satoshiFont.satoshiBold}>
                        Budget
                    </Text>
                    <Text className='text-sm text-black' style={satoshiFont.satoshiBlack}>
                        {formatCurrencyRounded(totalBudget, budget.currency)}
                    </Text>
                </View>
                <View className='flex flex-col items-center'>
                    <Text className='text-xs text-purple-500' style={satoshiFont.satoshiBold}>
                        {isOverBudget ? 'Over' : 'Left'}
                    </Text>
                    <Text 
                        className={`text-sm ${isOverBudget ? 'text-red-500' : 'text-green-600'}`} 
                        style={satoshiFont.satoshiBlack}
                    >
                        {formatCurrencyRounded(Math.abs(remainingBudget), budget.currency)}
                    </Text>
                </View>
            </View>

            {/* Progress indicator */}

            <View className='flex flex-row items-center space-x-0.5 mb-5'>
                <View
                    className='h-2 bg-purple-600 rounded-md'
                    style={{
                        width: `${Math.min(spentPercentage, 100)}%`,
                    }}
                />
                <View className='h-2 flex-grow bg-purple-200 rounded-md' />
            </View>

            <LineChart
                data={budgetLineData}
                data2={spendData}
                maxValue={globalMax}
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
    );
}
