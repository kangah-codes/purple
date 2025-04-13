import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '../lib/constants/Stylesheet';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import tw from 'twrnc';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View className='flex flex-col space-y-5 items-center justify-center bg-white px-5 h-full'>
                <Image source={require('@/assets/images/graphics/15.png')} style={tw`h-52 w-52`} />
                <View className='flex flex-col space-y-2.5'>
                    <Text
                        style={{ fontFamily: 'Suprapower' }}
                        className='text-2xl text-black text-center'
                    >
                        Looks like you're lost!
                    </Text>
                    <Text
                        style={GLOBAL_STYLESHEET.satoshiMedium}
                        className='text-sm textblack text-center'
                    >
                        The page you're looking for doesn't exist or has been moved.
                    </Text>
                </View>
                <TouchableOpacity
                    className='w-full'
                    onPress={() => {
                        router.push('/');
                    }}
                >
                    <LinearGradient
                        className='flex items-center justify-center rounded-full px-5 py-2.5 h-12'
                        colors={['#c084fc', '#9333ea']}
                    >
                        <Text
                            style={{ fontFamily: 'MonaSansBold' }}
                            className='text-base text-white tracking-tight'
                        >
                            Take me home
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
    linkText: {
        fontSize: 14,
        color: '#2e78b7',
    },
});
