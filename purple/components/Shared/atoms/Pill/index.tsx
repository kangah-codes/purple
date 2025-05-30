import React from 'react';
import { Text, View } from '../../styled';
import { satoshiFont } from '@/lib/constants/fonts';

type PillProps = {
    text: string;
};

export default function Pill({ text }: PillProps) {
    return (
        <View className='self-start border border-purple-500 rounded-full px-2 py-1 flex items-center justify-center bg-purple-100'>
            <Text
                style={satoshiFont.satoshiBold}
                className='text-purple-600 text-xs leading-[12px]'
            >
                {text}
            </Text>
        </View>
    );
}
