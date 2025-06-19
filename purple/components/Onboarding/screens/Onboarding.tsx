import Stories, { StoriesRef } from '@/components/Shared/molecules/Stories';
import { View } from '@/components/Shared/styled';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useRef } from 'react';
import { Image } from 'react-native';
import tw from 'twrnc';
import CurrencySetup from '../molecules/CurrencySetup';
import OnboardingPage from '../molecules/OnboardingPage';

export default function Screen() {
    const storiesRef = useRef<StoriesRef>(null);

    const pages = [
        <OnboardingPage
            title='Welcome to Purple!'
            description={
                'Purple helps you stay in control of your money with ease. Track your spending, set goals, and build better financial habits — all in one place.'
            }
            image={
                <Image
                    source={require('@/assets/images/graphics/iris.png')}
                    style={tw`rounded-3xl w-[200px] h-[200px]`}
                />
            }
            currentIndex={0}
            pages={4}
            storiesRef={storiesRef}
        />,
        <OnboardingPage
            title='Watch your spending'
            description={
                'See where your money goes. Categorize your expenses and find out what’s costing you the most so you can spend more intentionally.'
            }
            image={
                <Image
                    source={require('@/assets/images/graphics/10.png')}
                    style={tw`rounded-3xl w-[70px] h-[200px]`}
                />
            }
            currentIndex={1}
            pages={4}
            storiesRef={storiesRef}
        />,
        <OnboardingPage
            title='Know when you hit your limits'
            description={
                'Set flexible budgets and get alerts when you’re nearing your spending limits. No surprises — just smarter decisions.'
            }
            image={
                <Image
                    source={require('@/assets/images/graphics/6.png')}
                    style={tw`rounded-3xl w-[200px] h-[200px]`}
                />
            }
            currentIndex={2}
            pages={4}
            storiesRef={storiesRef}
        />,
        <OnboardingPage
            title='Take control of your finances'
            description={
                'Build savings, track your goals, and feel confident about your money. Purple makes personal finance simple and fun.'
            }
            image={
                <Image
                    source={require('@/assets/images/graphics/7.png')}
                    style={tw`rounded-3xl w-[150px] h-[200px]`}
                />
            }
            currentIndex={3}
            pages={4}
            storiesRef={storiesRef}
        />,
        <CurrencySetup />,
    ];

    return (
        <View className='w-full h-[100%]'>
            <Image
                source={require('@/assets/images/graphics/gradient-2.png')}
                style={tw`rounded-3xl w-full h-full absolute`}
            />
            <ExpoStatusBar style='dark' />
            <Stories
                pages={pages}
                ref={storiesRef}
                timePerPage={process.env.NODE_ENV == 'development' ? 1000 : 3000}
                enableNavigation={false}
                disableAutomaticScroll
            />
        </View>
    );
}
