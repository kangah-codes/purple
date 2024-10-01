import { Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { Image } from 'expo-image';
import React from 'react';
import tw from 'twrnc';

type EmptyListProps = {
    message: string;
};

export default function EmptyList({ message }: EmptyListProps) {
    return (
        <View className='flex flex-col space-y-5 items-center justify-center bg-white px-5'>
            <Image source={require('@/assets/images/graphics/19.png')} style={tw`h-24 w-52`} />
            <View className='flex flex-col space-y-2.5'>
                <Text
                    style={GLOBAL_STYLESHEET.suprapower}
                    className='text-2xl text-black text-center'
                >
                    Nothing to see here! 👀
                </Text>
                <Text
                    style={GLOBAL_STYLESHEET.interSemiBold}
                    className='text-sm textblack text-center'
                >
                    {message}
                </Text>
            </View>
        </View>
    );
}
