import React, { useMemo } from 'react';
import { View, Text } from '@/components/Shared/styled';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { satoshiFont } from '@/lib/constants/fonts';
import { BudgetCategoryCard } from './BudgetCategoryCard';
import BudgetSection from './BudgetSection';
import { BudgetWithDetails } from '@/lib/services/BudgetSQLiteService';
import { useBudgetEarnedIncome, useUnbudgetedCategorySpending } from '@/components/Plans/hooks';
import SpendVsBudgetLineChart from '@/components/Stats/molecules/SpendVsBudgetLineChart';
import { endOfMonth, formatISO, startOfMonth } from 'date-fns';
import { MONTHS } from '../../constants';
import { useTransactions } from '@/components/Transactions/hooks';
import { SummaryProgressSection } from './SummaryProgressSection';

interface BudgetSummaryProps {
    budget: BudgetWithDetails | null;
}
export default function BudgetSummary({ budget }: BudgetSummaryProps) {
    const budgetMonth = budget?.month;
    const budgetYear = budget?.year;
    const budgetId = budget?.id;
    const { data: calculatedEarnedIncome = 0 } = useBudgetEarnedIncome(budgetMonth, budgetYear);
    const totalAllocated = useMemo(() => {
        return (budget?.categoryLimits ?? []).reduce(
            (sum, cl) => sum + Number(cl.limit_amount ?? 0),
            0,
        );
    }, [budget?.categoryLimits]);
    const estimatedIncome = budget?.estimated_income || 0;
    const earnedIncome = calculatedEarnedIncome;
    const remainingIncome = estimatedIncome - earnedIncome;
    const isIncomeExceeded = remainingIncome < 0;
    const incomeDelta = Math.abs(remainingIncome);
    const incomePercentage = estimatedIncome > 0 ? (earnedIncome / estimatedIncome) * 100 : 0;
    const monthIndex = budgetMonth ? MONTHS.indexOf(budgetMonth) : new Date().getMonth();
    const resolvedMonthIndex = monthIndex === -1 ? new Date().getMonth() : monthIndex;
    const resolvedYear = budgetYear ?? new Date().getFullYear();
    const budgetStartDate = startOfMonth(new Date(resolvedYear, resolvedMonthIndex, 1));
    const budgetEndDate = endOfMonth(budgetStartDate);
    const { data: unbudgeted = [] } = useUnbudgetedCategorySpending(budgetMonth, budgetYear);
    const unbudgetedCategoryLimits = unbudgeted.map((u) => ({
        id: '',
        budget_id: '',
        category: u.category,
        limit_amount: 0,
        spent_amount: u.spent,
        rollover_enabled: false,
        notes: null,
    }));
    const { data: monthlyTransactions } = useTransactions({
        requestQuery: {
            page_size: Infinity,
            start_date: formatISO(budgetStartDate),
            end_date: formatISO(budgetEndDate),
        },
        options: {
            enabled: !!budget,
            keepPreviousData: true,
        },
    });
    const totalSpent = useMemo(() => {
        return (
            monthlyTransactions?.data
                ?.filter((t) => t.type === 'debit' && !t.from_account && !t.to_account)
                .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0
        );
    }, [monthlyTransactions?.data, budgetId]);
    const remainingBudget = totalAllocated - totalSpent;
    const isExpensesOverrun = remainingBudget < 0;
    const expensesDelta = Math.abs(remainingBudget);
    const spentPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    if (!budget) {
        return null;
    }

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
                <SummaryProgressSection
                    title='Income'
                    rightText={`${formatCurrencyRounded(
                        estimatedIncome,
                        budget.currency,
                    )} estimated`}
                    leftText={`${formatCurrencyRounded(earnedIncome, budget.currency)} earned`}
                    deltaText={`${formatCurrencyRounded(incomeDelta, budget.currency)} ${
                        isIncomeExceeded ? 'extra' : 'left'
                    }`}
                    percentage={incomePercentage}
                    variant='income'
                    isExceeded={isIncomeExceeded}
                />

                <View className='py-2.5'>
                    <View className='h-[0.5px] border-b border-purple-100 w-full' />
                </View>

                {/* Expenses */}
                <SummaryProgressSection
                    title='Expenses'
                    rightText={`${formatCurrencyRounded(totalAllocated, budget.currency)} budget`}
                    leftText={`${formatCurrencyRounded(totalSpent, budget.currency)} spent`}
                    deltaText={`${formatCurrencyRounded(expensesDelta, budget.currency)} ${
                        isExpensesOverrun ? 'over' : 'left'
                    }`}
                    percentage={spentPercentage}
                    variant='expense'
                    isExceeded={isExpensesOverrun}
                />
            </View>

            <SpendVsBudgetLineChart startDate={budgetStartDate} />

            {/* Expenses Breakdown */}
            <BudgetSection
                title={'Expenses'}
                rightHeaders={['Budget', 'Left']}
                items={budget.categoryLimits}
                emptyMessage={'No categories set up yet'}
                renderBody={() => (
                    <BudgetCategoryCard
                        type='budgeted-expense'
                        title={budget.type === 'category' ? 'Categories' : 'Allocations'}
                        transactionTypes={budget.categoryLimits.map((cl) => cl.category)}
                        categoryLimits={budget.categoryLimits}
                        currency={budget.currency}
                    />
                )}
            />

            <BudgetSection
                title={'Unbudgeted'}
                rightHeaders={['Spent']}
                items={unbudgeted}
                emptyMessage={'No unbudgeted expenses this month'}
                renderBody={() => (
                    <BudgetCategoryCard
                        title={'Unbudgeted Expenses'}
                        type='unbudgeted-expense'
                        transactionTypes={unbudgetedCategoryLimits.map((cl) => cl.category)}
                        categoryLimits={unbudgetedCategoryLimits}
                        currency={budget.currency}
                    />
                )}
            />
        </View>
    );
}
