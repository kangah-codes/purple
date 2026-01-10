/* eslint-disable @typescript-eslint/no-require-imports */
import { Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import tw from 'twrnc';
import { NO_BUDGET_MESSAGES } from '../../constants';

interface NoBudgetProps {
    month: Date;
}

export default function NoBudget({ month }: NoBudgetProps) {
    const message = useMemo(() => {
        // Use month and year as stable seed so the same month always shows the same message
        const monthKey = month.getMonth();
        const yearKey = month.getFullYear();
        const stableSeed = monthKey + yearKey * 12;
        const index = stableSeed % NO_BUDGET_MESSAGES.length;
        return NO_BUDGET_MESSAGES[index];
    }, [month]);

    return (
        <View className='flex-1 w-full flex flex-col justify-center p-5'>
            <View>
                <Image
                    source={require('@/assets/images/graphics/catto.png')}
                    style={tw`h-22 w-22`}
                />
            </View>
            <View className='flex flex-col space-y-2.5 mb-20'>
                <Text style={satoshiFont.satoshiBlack} className='text-2xl'>
                    {message.title}
                </Text>
                <Text style={satoshiFont.satoshiBold} className='text-sm text-purple-500'>
                    {message.body}
                </Text>
            </View>
        </View>
    );
}
