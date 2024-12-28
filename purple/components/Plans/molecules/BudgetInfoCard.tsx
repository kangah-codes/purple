import { LinearGradient, Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { useCallback, useMemo } from 'react';
import { PieChart } from 'react-native-gifted-charts';
import calculateTotalExpenseDetails from '../utils';
import { usePlanStore } from '../hooks';
import React from 'react';

type ExpensesCardProps = {
    accountCurrency: string;
    accountBalance: number;
    accountName: string;
    cardBackgroundColour: string;
    cardTintColour: string;
};

export default function BudgetInfoCard() {
    const { expensePlans } = usePlanStore();
    const budgetDetails = useMemo(() => calculateTotalExpenseDetails(expensePlans), [expensePlans]);

    return (
        <LinearGradient
            className='w-full p-5 rounded-2xl flex flex-col justify-center space-y-4 relative'
            // style={{ backgroundColor: item.cardBackgroundColour }}
            colors={['#c084fc', '#9333ea']}
        >
            <View className='flex flex-col'>
                <Text style={GLOBAL_STYLESHEET.suprapower} className='text-white text-5xl'>
                    {budgetDetails.totalExpensePercentage.toFixed(2)}%
                </Text>
                <View className='flex flex-col space-y-1.5'>
                    <Text
                        style={GLOBAL_STYLESHEET.interSemiBold}
                        className='text-white text-sm tracking-tighter'
                    >
                        of total budget spent
                    </Text>
                </View>
            </View>

            <View className='border-b border-purple-300 w-full' />

            <View className='w-full items-start'>
                <Text
                    style={GLOBAL_STYLESHEET.interSemiBold}
                    className='text-white text-sm tracking-tighter truncate'
                >
                    You're still on track for this month's expenses.
                </Text>
            </View>
        </LinearGradient>
    );
}
