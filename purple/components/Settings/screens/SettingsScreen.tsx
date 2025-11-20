import { SafeAreaView, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeftIcon } from '@/components/SVG/icons/24x24';
import SettingsGroups from '../molecules/SettingsGroups';

const linearGradientColours = ['#D8B4FE', '#fff'];

export default function SettingsScreen() {
    return (
        <SafeAreaView className='bg-purple-100 relative h-full' style={styles.parentView}>
            <ExpoStatusBar style='dark' />
            {/* <LinearGradient
                className='flex px-5 py-2.5 h-full absolute w-full'
                colors={linearGradientColours}
            /> */}
            <View className='w-full flex flex-row py-2.5 justify-between items-center relative px-5'>
                <TouchableOpacity
                    onPress={router.back}
                    className='bg-purple-50 px-4 py-2 flex items-center justify-center rounded-full'
                >
                    <ArrowLeftIcon stroke='#9333EA' strokeWidth={2.5} />
                </TouchableOpacity>

                <View className='absolute left-0 right-0 items-center'>
                    <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                        Settings
                    </Text>
                </View>
            </View>
            <View className='mt-2.5 px-5'>
                <SettingsGroups />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
