import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import { ChevronRightIcon } from '@/components/SVG/icons/16x16';
import { satoshiFont } from '@/lib/constants/fonts';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { extractEmojiOrDefault, truncateStringIfLongerThan } from '@/lib/utils/string';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Text, TouchableOpacity, View } from '../../Shared/styled';
import { useTransactionStore } from '../hooks';
import { RecurringTransaction } from '../schema';
import { formatLocalTime, getRRuleFrequency, getTransactionColour } from '../utils';

type RecurringTransactionCardProps = {
    transaction: RecurringTransaction;
};

export default function RecurringTransactionCard({ transaction }: RecurringTransactionCardProps) {
    const { setCurrentRecurringTransaction } = useTransactionStore();
    const { setShowBottomSheetModal } = useBottomSheetModalStore();
    const { frequency, time } = getRRuleFrequency(transaction.recurrence_rule);

    return (
        <TouchableOpacity
            className='w-full py-3.5 flex flex-row items-center space-x-3.5'
            activeOpacity={0.7}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCurrentRecurringTransaction(transaction);
                setShowBottomSheetModal('recurringTransactionReceipt', true);
            }}
        >
            <View className='relative items-center justify-center flex rounded-xl h-10 w-10 bg-purple-50'>
                <Text className='absolute text-lg'>
                    {extractEmojiOrDefault(transaction.category, '❔')}
                </Text>
            </View>

            <View className='flex flex-row justify-between items-center flex-grow'>
                <View className='flex flex-col'>
                    <Text style={satoshiFont.satoshiBlack} className='text-base'>
                        {truncateStringIfLongerThan(
                            transaction.category.includes(' ')
                                ? transaction.category.split(' ').slice(1).join(' ')
                                : transaction.category,
                            30,
                        )}
                    </Text>
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-500'>
                        {frequency} • {formatLocalTime(time)}
                    </Text>
                </View>

                <View className='flex flex-row space-x-2 items-center'>
                    <Text
                        style={[
                            satoshiFont.satoshiBlack,
                            { color: getTransactionColour(transaction.type) },
                        ]}
                        className='text-sm'
                    >
                        {transaction.type === 'debit'
                            ? '-'
                            : transaction.type === 'credit'
                            ? '+'
                            : ''}
                        {formatCurrencyRounded(transaction.amount, 'USD')}
                    </Text>

                    <ChevronRightIcon stroke='#9333ea' />
                </View>
            </View>
        </TouchableOpacity>
    );
}
