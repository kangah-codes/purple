import { LinearGradient, Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import React, { useMemo } from 'react';
import { usePlanStore } from '../hooks';
import calculateTotalExpenseDetails, { calculateTotalSavingDetails } from '../utils';
import { StyleSheet } from 'react-native';

type PlanInfoCardProps = {
    type: 'expense' | 'saving';
};
const linearGradientColours = ['#c084fc', '#9333ea'];

export default function PlanInfoCard({ type }: PlanInfoCardProps) {
    const { expensePlans, savingPlans } = usePlanStore();

    const budgetDetails = useMemo(() => {
        if (type === 'expense') {
            return calculateTotalExpenseDetails(expensePlans);
        }

        return calculateTotalSavingDetails(savingPlans);
    }, [expensePlans, savingPlans]);

    return (
        <LinearGradient
            className='w-full p-5 rounded-full flex flex-col justify-center space-y-4 relative'
            colors={linearGradientColours}
            style={style.linearGradient}
        >
            <View className='flex flex-col'>
                <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-white text-5xl'>
                    {budgetDetails.totalExpensePercentage.toFixed(2)}%
                </Text>
                <View className='flex flex-col space-y-1.5'>
                    <Text
                        style={GLOBAL_STYLESHEET.satoshiMedium}
                        className='text-white text-sm tracking-tighter'
                    >
                        {type === 'expense'
                            ? 'of expense budget spent'
                            : 'of saving goals achieved'}
                    </Text>
                </View>
            </View>
        </LinearGradient>
    );
}

const style = StyleSheet.create({
    linearGradient: {
        shadowColor: '#000',
        shadowOffset: {
            width: -2,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
});
