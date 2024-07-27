import { Image } from 'expo-image';
import React, { useRef } from 'react';
import Onboarding from 'react-native-onboarding-swiper';
import tw from 'twrnc';
import DoneButton from '../molecules/DoneButton';
import NextButton from '../molecules/NextButton';
import Pagination from '../molecules/Pagination';
import PersonalInformation from '../molecules/PersonalInformation';
import { router } from 'expo-router';

export default function Screen({}) {
    const formRef = useRef<{ submit: Function }>(null);

    const handleFormSubmit = () => {
        if (formRef.current) {
            formRef.current.submit();
        }
    };

    return (
        <Onboarding
            DotComponent={Pagination}
            NextButtonComponent={NextButton}
            // SkipButtonComponent={Skip}
            showSkip={false}
            skipToPage={3}
            DoneButtonComponent={DoneButton}
            onDone={() => {
                // setHasOnboardedTrue();
                // router.push('/(tabs)');
                // handleFormSubmit();
                router.replace('/onboarding/landing');
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
                    title: 'Keep a watchful eye on your spending',
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
                    title: 'Get notified when you overspend',
                    subtitle: 'Stay on top of your budget and never miss a beat',
                },
            ]}
        />
    );
}
