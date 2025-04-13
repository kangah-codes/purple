import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import React from 'react';
import { Text, TouchableOpacity, View } from '../../Shared/styled';

type TransactionBreakdownCardProps = {
    data: {
        type: string;
        category: string;
        percentage: string;
        amount: string;
    };
    onPress: () => void;
};

export default function TransactionBreakdownCard({ data, onPress }: TransactionBreakdownCardProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className='flex w-full flex-row items-center justify-between space-x-3.5 py-3.5 px-5'
        >
            <View className='relative items-center justify-center flex flex-row space-x-2.5'>
                <View className='flex items-center justify-center rounded-full bg-purple-100 px-2 py-1'>
                    <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-xs'>
                        {Math.abs(Number(data.percentage)).toFixed(2)}%
                    </Text>
                </View>

                <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='sm'>
                    {truncateStringIfLongerThan(data.category, 30)}
                </Text>
            </View>

            <Text
                style={[
                    GLOBAL_STYLESHEET.satoshiBlack,
                    { color: data.type === 'debit' ? '#DC2626' : 'rgb(22 163 74)' },
                ]}
                className='text-xs'
            >
                {data.type === 'debit' ? '' : '+'}
                {data.amount}
            </Text>
        </TouchableOpacity>
    );
}
