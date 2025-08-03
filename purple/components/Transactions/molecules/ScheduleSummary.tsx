import { View, Text } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import React from 'react';
import { getOrdinalSuffix } from '../utils';

type ScheduleSummaryProps = {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom' | '';
    dayOfWeek?: string;
    dayOfMonth?: number;
    customDate?: Date;
    time: string;
};

export default function ScheduleSummary({
    frequency,
    dayOfWeek,
    dayOfMonth,
    customDate,
    time,
}: ScheduleSummaryProps) {
    let summary = '';

    const isValid =
        frequency === 'daily' ||
        (frequency === 'weekly' && dayOfWeek) ||
        (frequency === 'monthly' && dayOfMonth) ||
        (frequency === 'custom' && customDate);

    if (!isValid) {
        return null;
    }

    switch (frequency) {
        case 'daily':
            summary = `Transaction will be created daily at ${time}`;
            break;
        case 'weekly':
            summary = `Transaction will be created weekly on ${dayOfWeek} at ${time}`;
            break;
        case 'monthly':
            const suffix = getOrdinalSuffix(dayOfMonth!);
            summary = `Transaction will be created on the ${dayOfMonth}${suffix} of each month at ${time}`;
            break;
        case 'custom':
            const day = customDate!.getDate();
            const suffixCustom = getOrdinalSuffix(day);
            const month = customDate!.toLocaleString('default', { month: 'long' });
            const year = customDate!.getFullYear();
            summary = `Transaction will be created on ${day}${suffixCustom} ${month} ${year} at ${time}`;
            break;
    }

    return (
        <View className='bg-purple-100 w-full rounded-3xl mt-2.5 flex flex-col p-1.5'>
            <View className='flex flex-col bg-white rounded-[20px] p-3'>
                <Text style={satoshiFont.satoshiBlack} className='text-sm text-purple-600'>
                    Schedule Summary
                </Text>
                <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-500'>
                    {summary}
                </Text>
            </View>
        </View>
    );
}
