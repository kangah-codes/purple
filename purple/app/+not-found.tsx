import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import React from 'react';
import tw from 'twrnc';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View className='flex flex-col space-y-5 items-center justify-center bg-white px-5 h-full'>
                <Image source={require('@/assets/images/graphics/15.png')} style={tw`h-52 w-52`} />
                <View className='flex flex-col space-y-2.5'>
                    <Text
                        style={satoshiFont.satoshiBlack}
                        className='text-2xl text-black text-center'
                    >
                        Looks like you're lost!
                    </Text>
                    <Text
                        style={satoshiFont.satoshiBold}
                        className='text-base textblack text-center'
                    >
                        The page you're looking for doesn't exist or has been moved.
                    </Text>
                </View>
                <TouchableOpacity className='w-full' onPress={router.back}>
                    <LinearGradient
                        className='flex items-center justify-center rounded-full px-5 py-2.5 h-12'
                        colors={['#c084fc', '#9333ea']}
                    >
                        <Text
                            style={satoshiFont.satoshiBold}
                            className='text-base text-white tracking-tight'
                        >
                            Take me back
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </>
    );
}
