import { useAuth } from '@/components/Auth/hooks';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import useGetCountry from '@/lib/hooks/useGetCountry';
import { setSecureValue } from '@/lib/utils/secureStorage';
import { nativeStorage } from '@/lib/utils/storage';
import { Image, ImageSource } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';
import { getLocales, getCalendars, useLocales } from 'expo-localization';

type OnboardingPageProps = {
    title: string;
    description: string;
    image: React.ReactNode;
    currentIndex?: number;
    pages: number;
};

export default function OnboardingPage({
    title,
    description,
    image,
    currentIndex,
    pages,
}: OnboardingPageProps) {
    const { setOnboarded, setSessionData } = useAuth();
    const a = useLocales();
    console.log(a, 'locale');

    return (
        <View className='flex flex-col space-y-5 justify-center px-5 h-[100%] bg-purple-50 relative'>
            <>{image}</>
            <View className='flex flex-col space-y-2.5'>
                <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-4xl text-black'>
                    {title}
                </Text>
                <Text style={GLOBAL_STYLESHEET.satoshiMedium} className='text-sm text-black'>
                    {description}
                </Text>
            </View>

            {currentIndex === pages - 1 && (
                <View className='flex flex-row space-x-5 absolute bottom-5 right-5'>
                    <TouchableOpacity
                        className=''
                        onPress={async () => {
                            nativeStorage.setItem('isOfflineMode', false);
                            await setOnboarded(true);
                        }}
                    >
                        <LinearGradient
                            className='flex items-center justify-center rounded-full px-4 py-2'
                            colors={['#c084fc', '#9333ea']}
                        >
                            <Text
                                style={GLOBAL_STYLESHEET.satoshiBold}
                                className='text-sm text-white'
                            >
                                Online Debug
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className=''
                        onPress={async () => {
                            nativeStorage.setItem('isOfflineMode', true);
                            setSessionData({
                                access_token: '',
                                access_token_expires_at: '',
                                user: {
                                    ID: 'test',
                                    username: 'test',
                                    email: 'test',
                                },
                            });
                            await setOnboarded(true);
                        }}
                    >
                        <LinearGradient
                            className='flex items-center justify-center rounded-full px-4 py-2'
                            colors={['#c084fc', '#9333ea']}
                        >
                            <Text
                                style={GLOBAL_STYLESHEET.satoshiBold}
                                className='text-sm text-white'
                            >
                                Get Started
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
