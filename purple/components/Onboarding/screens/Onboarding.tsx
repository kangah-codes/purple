import { useAuth } from '@/components/Auth/hooks';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import Onboarding from 'react-native-onboarding-swiper';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';
import DoneButton from '../molecules/DoneButton';
import NextButton from '../molecules/NextButton';
import Pagination from '../molecules/Pagination';

export default function Screen() {
    const { setOnboarded } = useAuth();

    return (
        <Onboarding
            DotComponent={Pagination}
            NextButtonComponent={NextButton}
            // SkipButtonComponent={Skip}
            showSkip={false}
            skipToPage={3}
            DoneButtonComponent={DoneButton}
            onDone={() => {
                // setOnboardedTrue();
                // router.push('/(tabs)');
                // handleFormSubmit();
                setOnboarded(true)
                    .then(() => {
                        alert('ONBOARDED');
                        router.replace('/onboarding/landing');
                    })
                    .catch((error) => {
                        Toast.show({
                            type: 'error',
                            props: {
                                text1: 'Error',
                                text2: 'Something went wrong',
                            },
                        });
                    });
            }}
            titleStyles={{ fontSize: 30, fontFamily: 'Suprapower', ...tw`px-5` }}
            subTitleStyles={{ fontSize: 15, fontFamily: 'InterMedium', ...tw`px-5` }}
            bottomBarColor='rgba(0, 0, 0,0)'
            bottomBarHighlight={false}
            pages={[
                {
                    backgroundColor: '#fff',
                    image: (
                        <Image
                            source={require('@/assets/images/icon.png')}
                            style={tw`h-32 w-32 rounded-2xl`}
                        />
                    ),
                    title: 'Welcome to Purple',
                    subtitle: 'Track your budget and finances seamlessly',
                },
                {
                    backgroundColor: '#fff',
                    image: (
                        <Image
                            source={require('@/assets/images/graphics/10.png')}
                            style={tw`h-72 w-72`}
                        />
                    ),
                    title: 'Watch your spending',
                    subtitle: 'See where your money is going and make better decisions',
                },
                {
                    backgroundColor: '#fff',
                    image: (
                        <Image
                            source={require('@/assets/images/graphics/6.png')}
                            style={tw`h-72 w-72`}
                        />
                    ),
                    title: 'Know when you hit your budget',
                    subtitle: 'Stay on top of your budget and never miss a beat',
                },
                {
                    backgroundColor: '#fff',
                    image: (
                        <Image
                            source={require('@/assets/images/graphics/7.png')}
                            style={tw`h-72 w-72`}
                        />
                    ),
                    title: 'Take control of your finances',
                    subtitle: 'Cultivate responsible spending habits and save more',
                },
            ]}
        />
    );
}
