import Stories, { StoriesRef } from '@/components/Shared/molecules/Stories';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useRef } from 'react';
import { Image } from 'react-native';
import tw from 'twrnc';
import OnboardingPage from '../molecules/OnboardingPage';

export default function Screen() {
    const storiesRef = useRef<StoriesRef>(null);

    const pages = [
        <OnboardingPage
            title='Welcome to Purple!'
            description={
                'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Doloribus aspernatur at voluptate accusantium, enim deserunt iste minima maiores non explicabo molestiae repellendus. Commodi veritatis enim sunt aperiam adipisci id explicabo.'
            }
            image={
                <Image
                    source={require('@/assets/images/graphics/8.png')}
                    style={tw`rounded-3xl w-[200px] h-[200px]`}
                />
            }
            currentIndex={0}
            pages={4}
        />,
        <OnboardingPage
            title='Watch your spending'
            description={
                'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Doloribus aspernatur at voluptate accusantium, enim deserunt iste minima maiores non explicabo molestiae repellendus. Commodi veritatis enim sunt aperiam adipisci id explicabo.'
            }
            image={
                <Image
                    source={require('@/assets/images/graphics/10.png')}
                    style={tw`rounded-3xl w-[70px] h-[200px]`}
                />
            }
            currentIndex={1}
            pages={4}
        />,
        <OnboardingPage
            title='Know when you hit your limits'
            description={
                'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Doloribus aspernatur at voluptate accusantium, enim deserunt iste minima maiores non explicabo molestiae repellendus. Commodi veritatis enim sunt aperiam adipisci id explicabo.'
            }
            image={
                <Image
                    source={require('@/assets/images/graphics/6.png')}
                    style={tw`rounded-3xl w-[200px] h-[200px]`}
                />
            }
            currentIndex={2}
            pages={4}
        />,
        <OnboardingPage
            title='Take control of your finances'
            description={
                'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Doloribus aspernatur at voluptate accusantium, enim deserunt iste minima maiores non explicabo molestiae repellendus. Commodi veritatis enim sunt aperiam adipisci id explicabo.'
            }
            image={
                <Image
                    source={require('@/assets/images/graphics/7.png')}
                    style={tw`rounded-3xl w-[150px] h-[200px]`}
                />
            }
            currentIndex={3}
            pages={4}
        />,
    ];

    return (
        <>
            <ExpoStatusBar style='dark' />
            <Stories
                pages={pages}
                ref={storiesRef}
                timePerPage={1500}
                enableNavigation={false}
                // disableAutomaticScroll
            />
        </>
    );
}
