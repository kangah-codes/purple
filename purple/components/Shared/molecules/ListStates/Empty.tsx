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
        <View className='flex flex-col space-y-5 items-center justify-center px-5'>
            <Image
                source={require('@/assets/images/graphics/cactus.png')}
                style={tw`h-[200px] w-[200px]`}
            />
            <View className='flex flex-col space-y-2.5'>
                <Text
                    style={GLOBAL_STYLESHEET.gramatikaBlack}
                    className='text-2xl text-black text-center'
                >
                    Wow, such empty.
                </Text>
                <Text
                    style={GLOBAL_STYLESHEET.gramatikaMedium}
                    className='text-sm textblack text-center'
                >
                    {message}
                </Text>
            </View>
        </View>
    );
}
