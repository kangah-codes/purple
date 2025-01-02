import { ArrowNarrowUpRightIcon } from '@/components/SVG/noscale';
import { Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import React, { useMemo } from 'react';
import { usePlanStore } from '../hooks';
import { calculateAmountAddedOnDay } from '../utils';
import { formatDateTime } from '@/lib/utils/date';

export default function PlanInformation() {
    const { currentPlan } = usePlanStore();
    if (!currentPlan) return null;

    const amountAdded = useMemo(() => calculateAmountAddedOnDay(currentPlan), [currentPlan]);
    const [startDate, endDate] = useMemo(
        () => [
            formatDateTime(currentPlan?.start_date, false),
            formatDateTime(currentPlan?.end_date),
        ],
        [currentPlan],
    );

    return (
        <View className='px-5 flex flex-col'>
            <Text
                style={GLOBAL_STYLESHEET.gramatikaBlack}
                className='text-black text-3xl tracking-tighter leading-[1.4] mt-1.5'
            >
                {formatCurrencyAccurate(currentPlan.currency, currentPlan.balance)}
            </Text>
            <Text
                style={GLOBAL_STYLESHEET.gramatikaBold}
                className='text-purple-700 text-sm tracking-tight'
            >
                {startDate.date} - {endDate.date}
            </Text>
            {amountAdded > 0 && (
                <View className='flex flex-row items-center space-x-1'>
                    <ArrowNarrowUpRightIcon width={16} height={16} stroke='#A855F7' />
                    <Text
                        style={GLOBAL_STYLESHEET.gramatikaMedium}
                        className='text-purple-500 text-sm tracking-tight'
                    >
                        {formatCurrencyAccurate(currentPlan.currency, amountAdded)} added today
                    </Text>
                </View>
            )}
        </View>
    );
}
