import { ArrowNarrowUpRightIcon } from '@/components/SVG/icons/noscale';
import { Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { formatDateTime } from '@/lib/utils/date';
import { formatCurrencyAccurate, formatCurrencyRounded } from '@/lib/utils/number';
import React from 'react';
import { usePlanStore } from '../hooks';
import { calculateAmountAddedOnDay } from '../utils';

export default function PlanInformation() {
    const { currentPlan } = usePlanStore();

    if (!currentPlan) return null;

    const amountAdded = calculateAmountAddedOnDay(currentPlan.transactions);
    const [startDate, endDate] = [
        formatDateTime(currentPlan.start_date, false),
        formatDateTime(currentPlan.end_date, false),
    ];
    const isOverdrawn =
        currentPlan.target - currentPlan.balance < 0 && currentPlan.type !== 'saving';
    const formattedAccurate = formatCurrencyAccurate(currentPlan.currency, currentPlan.balance);
    const shouldRoundBalance = formattedAccurate.length > 10;

    return (
        <View className='px-5 flex flex-col space-y-2.5'>
            <View className='flex flex-col'>
                <View className='flex flex-row items-end'>
                    <Text
                        style={[satoshiFont.satoshiBlack, { color: isOverdrawn ? 'red' : 'black' }]}
                        className='text-black text-3xl tracking-tighter leading-[1.4] mt-1.5'
                    >
                        {isOverdrawn && '-'}
                        {shouldRoundBalance
                            ? formatCurrencyRounded(currentPlan.balance, currentPlan.currency)
                            : formattedAccurate}
                    </Text>
                    <Text
                        style={satoshiFont.satoshiBlack}
                        className='text-black text-base mb-1 tracking-tight'
                    >
                        {' / '}
                        {formatCurrencyRounded(currentPlan.target, currentPlan.currency)}
                    </Text>
                </View>

                <Text
                    style={satoshiFont.satoshiBold}
                    className='text-purple-600 text-sm tracking-tight'
                >
                    {startDate.date} - {endDate.date}
                </Text>

                {amountAdded > 0 && (
                    <View className='flex flex-row items-center space-x-1'>
                        <ArrowNarrowUpRightIcon width={16} height={16} stroke='#A855F7' />
                        <Text
                            style={satoshiFont.satoshiBold}
                            className='text-purple-600 text-sm tracking-tight'
                        >
                            {formatCurrencyAccurate(currentPlan.currency, amountAdded)}{' '}
                            {currentPlan.type === 'expense' ? 'spent' : 'saved'} today
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
