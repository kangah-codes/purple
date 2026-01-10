import React from 'react';
import { View, Text } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';

type SummaryProgressSectionVariant = 'income' | 'expense';

interface SummaryProgressSectionProps {
    title: string;
    rightText: string;
    leftText: string;
    deltaText: string;
    percentage: number;
    variant: SummaryProgressSectionVariant;
    isExceeded: boolean;
}

export function SummaryProgressSection({
    title,
    rightText,
    leftText,
    deltaText,
    percentage,
    variant,
    isExceeded,
}: SummaryProgressSectionProps) {
    const exceededColorClass = variant === 'income' ? 'bg-green-600' : 'bg-red-500';
    const exceededTextColorClass = variant === 'income' ? 'text-green-600' : 'text-red-500';

    return (
        <View className='flex flex-col space-y-2'>
            <View className='flex flex-row justify-between items-center'>
                <Text className='text-sm text-black mb-1' style={satoshiFont.satoshiBold}>
                    {title}
                </Text>
                <Text className='text-xs text-purple-500' style={satoshiFont.satoshiBold}>
                    {rightText}
                </Text>
            </View>

            <View className='flex flex-row items-center space-x-0.5'>
                <View
                    className={`h-2 rounded-md ${
                        isExceeded ? exceededColorClass : 'bg-purple-600'
                    }`}
                    style={{
                        width: `${Math.min(percentage, 100)}%`,
                    }}
                />
                <View className='h-2 flex-grow bg-purple-200 rounded-md' />
            </View>

            <View className='flex-row justify-between'>
                <Text className='text-xs text-black' style={satoshiFont.satoshiBold}>
                    {leftText}
                </Text>
                <Text
                    className={`text-xs ${isExceeded ? exceededTextColorClass : 'text-purple-500'}`}
                    style={satoshiFont.satoshiBold}
                >
                    {deltaText}
                </Text>
            </View>
        </View>
    );
}
