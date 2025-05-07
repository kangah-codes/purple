import { useAuth } from '@/components/Auth/hooks';
import {
    LinearGradient,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import pkg from '@/package.json';
import { Portal } from '@gorhom/portal';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useState } from 'react';
import { ActivityIndicator, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import ProfilePages from '../molecules/ProfilePages';
import SelectCurrency from '../molecules/SelectCurrency';

const linearGradientColours = ['#D8B4FE', '#fff'];

export default function SettingsScreen() {
    const { destroySession, setOnboarded, isLoading } = useAuth();
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
                <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                    Settings
                </Text>
            </View>
            <View className='mt-10'>
                <ProfilePages />
            </View>

            <View className='flex flex-col space-y-2.5'>
                <View className='flex flex-row justify-center'>
                    <Text style={satoshiFont.satoshiMedium} className='text-xs text-purple-500'>
                        Purple v{pkg.version} {pkg.isBeta && 'beta'}
                    </Text>
                </View>
                {process.env.NODE_ENV == 'development' && (
                    <>
                        <TouchableOpacity
                            className='items-center self-center justify-center px-4 mt-10'
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
                                    style={satoshiFont.satoshiBlack}
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
                            disabled
                        >
                            <LinearGradient
                                className='flex items-center justify-center rounded-full px-5 w-[200] h-[50]'
                                colors={['#c084fc', '#9333ea']}
                            >
                                {isSignOutLoading ? (
                                    <ActivityIndicator size={15} color='#fff' />
                                ) : (
                                    <Text
                                        style={satoshiFont.satoshiBlack}
                                        className='text-white text-center'
                                    >
                                        Sign Out
                                    </Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
