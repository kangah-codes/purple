import { Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import React from 'react';

export default function MonthSavings() {
    return (
        <View className='w-full space-y-2.5 border border-purple-200 rounded-3xl p-5'>
            <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-base'>
                Savings this month
            </Text>

            <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-2xl text-purple-700'>
                GHS 1,000.00
            </Text>
            <Text
                style={GLOBAL_STYLESHEET.satoshiBlack}
                className='text-sm tracking-tight text-gray-400'
            >
                / GHS 2,000.00
            </Text>
            <View className='flex flex-row items-center space-x-0.5'>
                <View className='h-2 w-10 bg-purple-600 rounded-md' />
                <View className='h-2 flex-grow bg-purple-200 rounded-full' />
            </View>
        </View>
    );
}
