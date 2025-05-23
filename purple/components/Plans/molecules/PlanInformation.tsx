import { ArrowNarrowUpRightIcon } from '@/components/SVG/noscale';
import { Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { formatDateTime } from '@/lib/utils/date';
import { formatCurrencyAccurate, formatCurrencyRounded } from '@/lib/utils/number';
import React, { useMemo } from 'react';
import { usePlanStore } from '../hooks';
import { calculateAmountAddedOnDay } from '../utils';

export default function PlanInformation() {
    const { currentPlan } = usePlanStore();

    const amountAdded = useMemo(
        () => calculateAmountAddedOnDay(currentPlan?.transactions),
        [currentPlan],
    );
    const [startDate, endDate] = useMemo(
        () => [
            formatDateTime(currentPlan?.start_date, false),
            formatDateTime(currentPlan?.end_date, false),
        ],
        [currentPlan],
    );

    const isOverdrawn = (currentPlan?.target ?? 0) - (currentPlan?.balance ?? 0) < 0;
    if (!currentPlan) return null;

    return (
        <View className='px-5 flex flex-col space-y-2.5'>
            <View className='flex flex-col'>
                <View className='flex flex-row items-end'>
                    <Text
                        style={[
                            satoshiFont.satoshiBlack,
                            {
                                color: isOverdrawn ? 'red' : 'black',
                            },
                        ]}
                        className='text-black text-3xl tracking-tighter leading-[1.4] mt-1.5'
                    >
                        {isOverdrawn && '-'}
                        {formatCurrencyAccurate(currentPlan.currency, currentPlan.balance)}
                    </Text>
                    <Text style={satoshiFont.satoshiBlack} className='text-black text-base mb-1'>
                        {' / '}
                        {formatCurrencyRounded(currentPlan.balance, currentPlan.currency)}
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
                            {currentPlan.type == 'expense' ? 'spent' : 'saved'} today
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
