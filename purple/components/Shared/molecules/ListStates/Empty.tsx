import { Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { Image } from 'expo-image';
import React from 'react';
import tw from 'twrnc';

type EmptyListProps = {
    message: string;
};

export default function EmptyList({ message }: EmptyListProps) {
    return (
        <View className='flex flex-col items-center justify-center px-5'>
            <Image
                source={require('@/assets/images/graphics/kabosu.png')}
                style={tw`h-[170px] w-[200px]`}
            />
            <View className='flex flex-col'>
                <Text
                    style={GLOBAL_STYLESHEET.satoshiBlack}
                    className='text-2xl text-black text-center'
                >
                    Wow, such empty.
                </Text>
                <Text
                    style={GLOBAL_STYLESHEET.satoshiBold}
                    className='text-sm text-purple-500 text-center'
                >
                    {message}
                </Text>
            </View>
        </View>
    );
}
