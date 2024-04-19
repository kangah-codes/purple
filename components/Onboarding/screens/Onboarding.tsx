import React from 'react';
import { Platform, StyleSheet, Button } from 'react-native';
import {
    TouchableOpacity,
    View,
    Text,
    LinearGradient,
    ScrollView,
} from '@/components/Shared/styled';
import Onboarding from 'react-native-onboarding-swiper';
import { Image } from 'expo-image';
import tw from 'twrnc';
import useHasOnboarded from '@/lib/db/db';
import { router } from 'expo-router';

function Pagination({ selected }: { selected: boolean }) {
    return (
        <View
            className='w-2 h-2 rounded-full mx-0.5'
            style={{
                backgroundColor: selected ? 'rgb(124,36,206)' : '#FAF5FF',
            }}
        />
    );
}

function NextButtonComponent(props: any) {
    return (
        <View className='px-5'>
            <TouchableOpacity {...props}>
                <LinearGradient
                    className='flex items-center justify-center rounded-full px-5 py-2'
                    colors={['#c084fc', '#9333ea']}
                >
                    <Text
                        style={{ fontFamily: 'InterBold' }}
                        className='text-sm text-white tracking-tight'
                    >
                        Next
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

function DoneButtonComponent(props: any) {
    return (
        <View className='px-5'>
            <TouchableOpacity {...props}>
                <LinearGradient
                    className='flex items-center justify-center rounded-full px-5 py-2'
                    colors={['#c084fc', '#9333ea']}
                >
                    <Text
                        style={{ fontFamily: 'InterBold' }}
                        className='text-sm text-white tracking-tight'
                    >
                        Done
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

export default function Screen({ navigation }) {
    const { setHasOnboardedTrue } = useHasOnboarded();
    return (
        <Onboarding
            DotComponent={Pagination}
            NextButtonComponent={NextButtonComponent}
            // SkipButtonComponent={Skip}
            showSkip={false}
            skipToPage={3}
            DoneButtonComponent={DoneButtonComponent}
            onDone={() => {
                setHasOnboardedTrue();
                router.push('/(tabs)');
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
                            style={tw`h-72 w-72]`}
                        />
                    ),
                    title: 'Keep a watchful eye on your spending',
                    subtitle: 'See where your money is going and make better decisions',
                },
                {
                    backgroundColor: '#E9D5FF',
                    image: (
                        <Image
                            source={require('@/assets/images/graphics/6.png')}
                            style={tw`h-72 w-72]`}
                        />
                    ),
                    title: 'Get notified when you overspend',
                    subtitle: 'Stay on top of your budget and never miss a beat',
                },
            ]}
        />
    );
}
