import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { currencies } from '@/lib/constants/currencies';
import { formatCurrencyRounded, formatNumberRounded } from '@/lib/utils/number';
import { differenceInDays } from 'date-fns';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Plan } from '../schema';
import { calculateRemainingForCurrentPeriod } from '../utils';

const now = new Date();

export default function BudgetPlanCard({ data }: { data: Plan }) {
    const {
        start_date,
        end_date,
        balance,
        target,
        type,
        transactions,
        deposit_frequency,
        currency,
    } = data;
    const amountSpent = Math.abs(Math.min((data.balance / data.target) * 100, 100));
    const daysLeft = differenceInDays(new Date(data.end_date), now);
    const isExpense = type == 'expense';
    const { remaining, frequency, isOverPeriodAmount, overageAmount } = useMemo(() => {
        const { remainingAmount, isOverPeriodAmount, overageAmount } =
            calculateRemainingForCurrentPeriod(
                new Date(start_date),
                new Date(end_date),
                target,
                deposit_frequency,
                transactions,
                isExpense,
            );
        const frequency = () => {
            switch (deposit_frequency) {
                case 'bi-weekly':
                    return '2-week period';
                case 'monthly':
                    return 'month';
                case 'weekly':
                    return 'week';
            }
        };

        return {
            remaining: remainingAmount,
            frequency: frequency(),
            isOverPeriodAmount,
            overageAmount,
        };
    }, [data]);

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
                                color: daysLeft < 0 || isOverPeriodAmount ? '#fb2c36' : '#ad46ff',
                            },
                        ]}
                        className='text-xs'
                    >
                        {isOverPeriodAmount ? (
                            <>
                                Over target amount for this {frequency} by{' '}
                                {formatCurrencyRounded(overageAmount, currency)}
                            </>
                        ) : (
                            <>
                                {formatCurrencyRounded(remaining, currency)} left{' '}
                                {isExpense ? 'to spend' : 'to save'} this {frequency}
                            </>
                        )}
                    </Text>
                </View>

                <View className='flex flex-row items-center space-x-0.5 mt-5'>
                    <View
                        className='h-5 bg-purple-600 rounded-md'
                        style={{
                            width: `${Math.min(amountSpent, 100)}%`,
                        }}
                    />
                    <View className='h-5 flex-grow bg-purple-200 rounded-md' />
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
