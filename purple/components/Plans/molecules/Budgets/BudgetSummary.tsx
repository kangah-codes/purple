import React from 'react';
import { View, Text } from '@/components/Shared/styled';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { satoshiFont } from '@/lib/constants/fonts';
import { BudgetCategoryCard } from './BudgetCategoryCard';
import { BudgetWithDetails } from '@/lib/services/BudgetSQLiteService';
import { useBudgetEarnedIncome } from '@/components/Plans/hooks';
import SpendVsBudgetLineChart from '@/components/Stats/molecules/SpendVsBudgetLineChart';
import { startOfMonth } from 'date-fns';
import { MONTHS } from '../../constants';

interface BudgetSummaryProps {
    budget: BudgetWithDetails | null;
}

export default function BudgetSummary({ budget }: BudgetSummaryProps) {
    const { data: calculatedEarnedIncome = 0 } = useBudgetEarnedIncome(budget?.month, budget?.year);

    if (!budget) {
        return null;
    }

    const totalAllocated = budget.summary?.total_allocated || 0;
    const totalSpent = budget.summary?.total_spent || 0;
    const remainingBudget = totalAllocated - totalSpent;
    const isExpensesOverrun = remainingBudget < 0;
    const expensesDelta = Math.abs(remainingBudget);
    const spentPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
    const estimatedIncome = budget.estimated_income || 0;
    const earnedIncome = calculatedEarnedIncome;
    const remainingIncome = estimatedIncome - earnedIncome;
    const isIncomeExceeded = remainingIncome < 0;
    const incomeDelta = Math.abs(remainingIncome);
    const incomePercentage = estimatedIncome > 0 ? (earnedIncome / estimatedIncome) * 100 : 0;
    const getMonthIndex = (monthName: string) => {
        return MONTHS.indexOf(monthName);
    };

    const monthIndex = getMonthIndex(budget.month);
    const budgetStartDate = startOfMonth(
        new Date(budget.year, monthIndex === -1 ? new Date().getMonth() : monthIndex, 1),
    );

    return (
        <View className='px-5 pb-5'>
            {/* Summary Section */}
            <View className='bg-purple-50 px-5 pb-5 pt-3.5 rounded-3xl border border-purple-100 flex flex-col space-y-2.5'>
                <View className='flex-row justify-between items-center'>
                    <Text className='text-base text-black' style={satoshiFont.satoshiBold}>
                        Summary
                    </Text>
                </View>

                <View className='h-[0.5px] border-b border-purple-100 w-full' />

                {/* Income */}
                <View className='flex flex-col space-y-2'>
                    <View className='flex flex-row justify-between items-center'>
                        <Text className='text-sm text-black mb-1' style={satoshiFont.satoshiBold}>
                            Income
                        </Text>
                        <Text className='text-xs text-purple-500' style={satoshiFont.satoshiBold}>
                            {formatCurrencyRounded(estimatedIncome, budget.currency)} estimated
                        </Text>
                    </View>

                    <View className='flex flex-row items-center space-x-0.5'>
                        <View
                            className={`h-2 rounded-md ${
                                isIncomeExceeded ? 'bg-green-600' : 'bg-purple-600'
                            }`}
                            style={{
                                width: `${Math.min(incomePercentage, 100)}%`,
                            }}
                        />
                        <View className='h-2 flex-grow bg-purple-200 rounded-md' />
                    </View>

                    <View className='flex-row justify-between'>
                        <Text className='text-xs text-black' style={satoshiFont.satoshiBold}>
                            {formatCurrencyRounded(earnedIncome, budget.currency)} earned
                        </Text>
                        <Text
                            className={`text-xs ${
                                isIncomeExceeded ? 'text-green-600' : 'text-purple-500'
                            }`}
                            style={satoshiFont.satoshiBold}
                        >
                            {formatCurrencyRounded(incomeDelta, budget.currency)}{' '}
                            {isIncomeExceeded ? 'extra' : 'left'}
                        </Text>
                    </View>
                </View>

                <View className='py-2.5'>
                    <View className='h-[0.5px] border-b border-purple-100 w-full' />
                </View>

                {/* Expenses */}
                <View className='flex flex-col space-y-2'>
                    <View className='flex flex-row justify-between items-center'>
                        <Text className='text-sm text-black mb-1' style={satoshiFont.satoshiBold}>
                            Expenses
                        </Text>
                        <Text className='text-xs text-purple-500' style={satoshiFont.satoshiBold}>
                            {formatCurrencyRounded(totalAllocated, budget.currency)} budget
                        </Text>
                    </View>

                    <View className='flex flex-row items-center space-x-0.5'>
                        <View
                            className={`h-2 rounded-md ${
                                isExpensesOverrun ? 'bg-red-500' : 'bg-purple-600'
                            }`}
                            style={{
                                width: `${Math.min(spentPercentage, 100)}%`,
                            }}
                        />
                        <View className='h-2 flex-grow bg-purple-200 rounded-md' />
                    </View>

                    <View className='flex-row justify-between'>
                        <Text className='text-xs text-black' style={satoshiFont.satoshiBold}>
                            {formatCurrencyRounded(totalSpent, budget.currency)} spent
                        </Text>
                        <Text
                            className={`text-xs ${
                                isExpensesOverrun ? 'text-red-500' : 'text-purple-500'
                            }`}
                            style={satoshiFont.satoshiBold}
                        >
                            {formatCurrencyRounded(expensesDelta, budget.currency)}{' '}
                            {isExpensesOverrun ? 'over' : 'left'}
                        </Text>
                    </View>
                </View>
            </View>

            <SpendVsBudgetLineChart startDate={budgetStartDate} />

            {/* Expenses Breakdown */}
            <View className='flex flex-col space-y-5 mt-5'>
                <View className='flex-row justify-between items-center px-5'>
                    <Text className='text-base text-black' style={satoshiFont.satoshiBold}>
                        Expenses
                    </Text>

                    <View className='flex-row'>
                        <Text
                            className='text-xs text-purple-500 ml-8'
                            style={satoshiFont.satoshiBold}
                        >
                            Budget
                        </Text>
                        <Text
                            className='text-xs text-purple-500 ml-8'
                            style={satoshiFont.satoshiBold}
                        >
                            Left
                        </Text>
                    </View>
                </View>

                {budget.categoryLimits.length > 0 ? (
                    <View>
                        <BudgetCategoryCard
                            title={budget.type === 'category' ? 'Categories' : 'Allocations'}
                            transactionTypes={budget.categoryLimits.map((cl) => cl.category)}
                            categoryLimits={budget.categoryLimits}
                            currency={budget.currency}
                        />
                    </View>
                ) : (
                    <View className='px-5'>
                        <Text className='text-sm text-gray-500' style={satoshiFont.satoshiMedium}>
                            No categories set up yet
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
