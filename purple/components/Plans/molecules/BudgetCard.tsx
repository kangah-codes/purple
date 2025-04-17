import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { formatDate } from '@/lib/utils/date';
import { formatCurrencyAccurate, formatNumberRounded } from '@/lib/utils/number';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Plan } from '../schema';
import { StyleSheet } from 'react-native';
import { currencies } from '@/lib/constants/currencies';
import { differenceInDays } from 'date-fns';

const now = new Date();
export default function BudgetPlanCard({ data }: { data: Plan }) {
    const { start_date, end_date, balance, target, name, currency, type } = data;
    const isExpense = type === 'expense';
    const progressAmount = isExpense ? target - balance : balance;
    const remainingAmount = isExpense ? Math.max(balance, 0) : Math.max(target - balance, 0);
    const amountSpent = Math.abs(Math.min((data.balance / data.target) * 100, 100));
    const daysLeft = differenceInDays(new Date(data.end_date), now);
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
        <TouchableOpacity onPress={() => router.push(`/plans/${data.id}`)} activeOpacity={0.9}>
            <View
                className='p-4 rounded-3xl flex flex-col w-full bg-purple-50'
                style={styles.planCard}
            >
                <View className='flex flex-col space-y-0.5 w-full'>
                    <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-sm text-black'>
                        {data.category}
                    </Text>
                    <Text
                        style={[
                            GLOBAL_STYLESHEET.satoshiBold,
                            {
                                color: daysLeft < 0 ? '#fb2c36' : '#ad46ff',
                            },
                        ]}
                        className='text-xs'
                    >
                        {Math.abs(daysLeft)} day{Math.abs(daysLeft) > 1 && 's'}{' '}
                        {daysLeft < 0 ? 'overdue' : 'left'}
                    </Text>
                </View>

                <View className='flex flex-col w-full mt-7'>
                    <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-xs text-black'>
                        {amountSpent.toFixed(0)}% {type === 'expense' ? 'spent' : 'saved'}
                    </Text>
                    <View className='flex flex-row text-black'>
                        <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-sm mt-0.5'>
                            {currencies.find((cur) => cur.code === data.currency)?.symbol}
                        </Text>
                        <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-2xl'>
                            {formatNumberRounded(balance)}
                        </Text>
                    </View>
                    <Text
                        style={[
                            GLOBAL_STYLESHEET.satoshiBold,
                            {
                                color: daysLeft < 0 ? '#fb2c36' : '#ad46ff',
                            },
                        ]}
                        className='text-xs'
                    >
                        left this week
                    </Text>
                </View>

                <View className='flex flex-row items-center space-x-0.5 mt-5'>
                    <View
                        className='h-5 bg-purple-600 rounded-md'
                        style={{
                            width: `${Math.min(amountSpent, 100)}%`,
                        }}
                    />
                    <View className='h-5 flex-grow bg-purple-200 rounded-lg' />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    planCard: {
        // shadowColor: '#A855F7',
        // shadowOffset: {
        //     width: 0,
        //     height: 2,
        // },
        // shadowOpacity: 0.125,
        // shadowRadius: 8,
        // elevation: 5,
    },
});
