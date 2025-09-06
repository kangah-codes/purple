import { Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { Image, ImageSource } from 'expo-image';
import React from 'react';
import tw from 'twrnc';

type EmptyListProps = {
    message: string;
    title?: string;
    image?: string | number | ImageSource | ImageSource[] | string[] | null | undefined;
};

export default function EmptyList({ message, title, image }: EmptyListProps) {
    return (
        <View className='flex flex-col items-center justify-center px-5'>
            <Image
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                source={image ? image : require('@/assets/images/graphics/20.png')}
                style={tw`h-[200px] w-[200px]`}
            />
            <View className='flex flex-col'>
                <Text style={satoshiFont.satoshiBlack} className='text-2xl text-black text-center'>
                    {title || 'Wow, such empty.'}
                </Text>
                <Text
                    style={satoshiFont.satoshiBold}
                    className='text-sm text-purple-500 text-center'
                >
                    {message}
                </Text>
            </View>
        </View>
    );
}
