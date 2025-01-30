import { useAuth } from '@/components/Auth/hooks';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { Image, ImageSource } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';

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
    const { setOnboarded } = useAuth();

    return (
        <View className='flex flex-col space-y-5 justify-center px-5 h-[100%] bg-purple-50 relative'>
            {image}
            <View className='flex flex-col space-y-2.5'>
                <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-4xl text-black'>
                    {title}
                </Text>
                <Text style={GLOBAL_STYLESHEET.satoshiMedium} className='text-sm text-black'>
                    {description}
                </Text>
            </View>

            {currentIndex === pages - 1 && (
                <TouchableOpacity
                    className='absolute bottom-5 right-5'
                    onPress={() => {
                        setOnboarded(true)
                            .then(() => {
                                router.replace('/onboarding/landing');
                            })
                            .catch(() => {
                                Toast.show({
                                    type: 'error',
                                    props: {
                                        text1: 'Error',
                                        text2: 'Something went wrong',
                                    },
                                });
                            });
                    }}
                >
                    <LinearGradient
                        className='flex items-center justify-center rounded-full px-4 py-2'
                        colors={['#c084fc', '#9333ea']}
                    >
                        <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-sm text-white'>
                            Get Started
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </View>
    );
}
