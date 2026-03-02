import { View, Text } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import React from 'react';
import { calculateTransactionSchedule } from '../utils';

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
    const summary = calculateTransactionSchedule(
        frequency,
        time,
        dayOfWeek,
        dayOfMonth,
        customDate,
    );

    if (!summary) return null;

    return (
        <View className='bg-purple-50 border border-purple-100 rounded-3xl w-full mt-2.5 flex flex-col'>
            <View className='flex flex-col p-3'>
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
