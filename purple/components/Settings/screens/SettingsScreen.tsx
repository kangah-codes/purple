import { useAuth } from '@/components/Auth/hooks';
import Avatar from '@/components/Shared/atoms/Avatar';
import {
    LinearGradient,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import pkg from '@/package.json';
import { Redirect } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import { ActivityIndicator, Button, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { nativeStorage } from '@/lib/utils/storage';
import React, { useState } from 'react';
import { Image } from 'expo-image';
import tw from 'twrnc';
import ProfilePages from '../molecules/ProfilePages';
import SelectCurrency from '../molecules/SelectCurrency';
import { Portal } from '@gorhom/portal';

const linearGradientColours = ['#D8B4FE', '#fff'];

export default function SettingsScreen() {
    const { destroySession, sessionData, hasOnboarded, setOnboarded, isLoading } = useAuth();
    const [isSignOutLoading, setIsSignOutLoading] = useState(false);

    if (isLoading) {
        return null;
    }

    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <ExpoStatusBar style='dark' />
            <Portal>
                <SelectCurrency />
            </Portal>
            <LinearGradient
                className='flex px-5 py-2.5 h-[350] absolute w-full'
                colors={linearGradientColours}
            />
            <View className='flex px-5 flex-row justify-between items-center pt-2.5'>
                <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-lg'>
                    Settings
                </Text>
            </View>
            <View className='flex items-center justify-center space-y-2.5 mt-5'>
                <View className='flex items-center justify-center bg-purple-50 border border-purple-300 rounded-full w-20 h-20'>
                    <Image
                        source={require('@/assets/images/graphics/catto.png')}
                        style={tw`h-12 w-12`}
                    />
                </View>
            </View>
            <View className='mt-5'>
                <ProfilePages />
            </View>

            <View className='flex flex-col space-y-2.5'>
                <View className='flex flex-row justify-center'>
                    <Text
                        style={GLOBAL_STYLESHEET.satoshiBold}
                        className='text-sm text-purple-500 tracking-tight'
                    >
                        Purple v{pkg.version}
                    </Text>
                </View>
                <TouchableOpacity
                    className='items-center self-center justify-center px-4'
                    onPress={() => {
                        setOnboarded(false).then(() =>
                            destroySession().then(() => {
                                Toast.show({
                                    type: 'info',
                                    props: {
                                        text1: 'Cache reset',
                                        text2: 'The entire app cache has been cleared!',
                                    },
                                });
                            }),
                        );
                    }}
                >
                    <LinearGradient
                        className='flex items-center justify-center rounded-full px-5 w-[200] h-[50]'
                        colors={['#F87171', '#DC2626']}
                    >
                        <Text
                            style={GLOBAL_STYLESHEET.satoshiBlack}
                            className='text-white text-center'
                        >
                            Reset App Cache
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    className='items-center self-center justify-center px-4'
                    onPress={() => {
                        setIsSignOutLoading(true);
                        destroySession().then(() => {
                            Toast.show({
                                type: 'info',
                                props: {
                                    text1: 'Signed Out',
                                    text2: 'Signed out of Purple',
                                },
                            });
                        });
                    }}
                    // disabled={isLoading}
                >
                    <LinearGradient
                        className='flex items-center justify-center rounded-full px-5 w-[200] h-[50]'
                        colors={['#c084fc', '#9333ea']}
                    >
                        {isSignOutLoading ? (
                            <ActivityIndicator size={15} color='#fff' />
                        ) : (
                            <Text
                                style={GLOBAL_STYLESHEET.satoshiBlack}
                                className='text-white text-center'
                            >
                                Sign Out
                            </Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
