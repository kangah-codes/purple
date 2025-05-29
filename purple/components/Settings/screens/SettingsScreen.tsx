import { LinearGradient, SafeAreaView, Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import ProfilePages from '../molecules/ProfilePages';

const linearGradientColours = ['#D8B4FE', '#fff'];

export default function SettingsScreen() {
    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <ExpoStatusBar style='dark' />
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
