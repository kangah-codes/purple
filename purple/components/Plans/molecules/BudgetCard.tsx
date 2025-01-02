import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { formatDate } from '@/lib/utils/date';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Plan } from '../schema';
import { StyleSheet } from 'react-native';

export default function BudgetPlanCard({ data }: { data: Plan }) {
    const { start_date, end_date, balance, target, name, currency, type } = data;
    const isExpense = type === 'expense';
    const progressAmount = isExpense ? target - balance : balance;
    const remainingAmount = isExpense ? Math.max(balance, 0) : Math.max(target - balance, 0);
    const getLabelsByType = useCallback(
        () => ({
            progressLabel: isExpense ? 'Remaining budget' : 'Saved so far',
            remainingLabel: isExpense ? 'Spent so far' : 'Still to save',
            targetLabel: isExpense ? 'Budget limit' : 'Savings goal',
        }),
        [data],
    );
    const labels = getLabelsByType();

    return (
        <TouchableOpacity onPress={() => router.push(`/plans/${data.ID}`)}>
            <View className='p-4 border border-gray-200 rounded-2xl flex flex-col space-y-2.5 w-full bg-white'>
                <View className='flex flex-row w-full justify-between items-center'>
                    <Text style={GLOBAL_STYLESHEET.suprapower} className='text-base text-black'>
                        {truncateStringIfLongerThan(name, 20)}
                    </Text>
                </View>

                <View className='flex flex-col space-y-2.5'>
                    <View className='flex flex-row items-center space-x-0.5'>
                        <View
                            className='h-2 bg-purple-600 rounded-md'
                            style={{
                                width: `${Math.min((data.balance / data.target) * 100, 100)}%`,
                            }}
                        />
                        <View className='h-2 flex-grow bg-purple-200 rounded-full' />
                    </View>

                    <View className='flex flex-row justify-between items-center'>
                        <Text
                            style={GLOBAL_STYLESHEET.monaSansBold}
                            className='text-sm text-black tracking-tighter'
                        >
                            {formatDate(start_date, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </Text>
                        <Text
                            style={GLOBAL_STYLESHEET.monaSansBold}
                            className='text-sm text-black tracking-tighter'
                        >
                            {formatDate(end_date, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </Text>
                    </View>
                </View>

                <View className='h-[1.5px] bg-purple-50 w-full' />

                <View className='bg-purple-50 p-3.5 rounded-xl space-y-2.5 flex flex-col'>
                    <View className='flex flex-row justify-between items-center'>
                        <Text
                            style={GLOBAL_STYLESHEET.monaSansBold}
                            className='text-sm text-gray-700 tracking-tight'
                        >
                            {labels.progressLabel}
                        </Text>
                        <Text
                            style={GLOBAL_STYLESHEET.monaSansSemiBold}
                            className='text-sm text-black tracking-tighter'
                        >
                            {formatCurrencyAccurate(currency, progressAmount)}
                        </Text>
                    </View>
                    <View className='border-b border-purple-200 w-full' />
                    <View className='flex flex-row justify-between items-center'>
                        <Text
                            style={GLOBAL_STYLESHEET.monaSansBold}
                            className='text-sm text-gray-700 tracking-tight'
                        >
                            {labels.remainingLabel}
                        </Text>
                        <Text
                            style={GLOBAL_STYLESHEET.monaSansSemiBold}
                            className='text-sm text-gray-700 tracking-tight'
                        >
                            {formatCurrencyAccurate(currency, remainingAmount)}
                        </Text>
                    </View>
                    <View className='border-b border-purple-200 w-full' />
                    <View className='flex flex-row justify-between items-center'>
                        <Text
                            style={GLOBAL_STYLESHEET.monaSansBold}
                            className='text-sm text-gray-700 tracking-tight'
                        >
                            {labels.targetLabel}
                        </Text>
                        <Text
                            style={GLOBAL_STYLESHEET.monaSansSemiBold}
                            className='text-sm text-black tracking-tighter'
                        >
                            {formatCurrencyAccurate(currency, target)}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
