import { TouchableOpacity, Text, View } from '@/components/Shared/styled';
import { RecurringTransaction } from '../schema';
import { ChevronRightIcon } from '@/components/SVG/icons/16x16';
import { satoshiFont } from '@/lib/constants/fonts';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { format } from 'date-fns';
import React from 'react';
import { getTransactionColour } from '../utils';
import { useTransactionStore } from '../hooks';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';

export default function UpcomingTransactionCard({
    transaction,
}: {
    transaction: RecurringTransaction;
}) {
    const { setCurrentRecurringTransaction } = useTransactionStore();
    const { setShowBottomSheetModal, bottomSheetModalKeys } = useBottomSheetModalStore();
    const nextDate = new Date(transaction.create_next_at);

    return (
        <TouchableOpacity
            key={transaction.id}
            className='flex flex-row items-center justify-between space-x-2 py-2.5'
            onPress={() => {
                setCurrentRecurringTransaction(transaction);
                setShowBottomSheetModal('recurringTransactionReceipt', true);
            }}
        >
            <View className='flex flex-row items-center space-x-2'>
                <View className='flex flex-col p-2.5 bg-purple-50 rounded-xl items-center'>
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-500'>
                        {format(nextDate, 'MMM')}
                    </Text>
                    <Text style={satoshiFont.satoshiBlack} className='text-sm text-purple-600'>
                        {format(nextDate, 'dd')}
                    </Text>
                </View>
                <View className='flex flex-col'>
                    <Text style={satoshiFont.satoshiBlack} className='text-sm'>
                        {transaction.category}
                    </Text>
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-500'>
                        {format(nextDate, 'hh:mm a')}
                    </Text>
                </View>
            </View>

            <View className='flex flex-row space-x-2 items-center'>
                <Text
                    style={[
                        satoshiFont.satoshiBlack,
                        { color: getTransactionColour(transaction.type) },
                    ]}
                    className='text-sm'
                >
                    {transaction.type === 'debit' ? '-' : transaction.type === 'credit' ? '+' : ''}
                    {formatCurrencyRounded(transaction.amount, 'GHS')}
                </Text>

                <ChevronRightIcon stroke='#9333ea' />
            </View>
        </TouchableOpacity>
    );
}
