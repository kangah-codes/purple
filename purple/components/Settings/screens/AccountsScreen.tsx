import { ArrowLeftIcon } from '@/components/SVG/24x24';
import { ScaleIcon } from '@/components/SVG/noscale';
import { SafeAreaView, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useState } from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import { Switch } from 'react-native-switch';
import { usePreferences } from '../hooks';
import SettingsList from '../molecules/SettingsList';
import { SettingsListItem } from '../schema';
import { SettingsServiceFactory } from '@/lib/factory/SettingsFactory';
import Toast from 'react-native-toast-message';
import { useSQLiteContext } from 'expo-sqlite';

export default function AccountsScreen() {
    const {
        preferences: { allowOverdraw },
        setPreference,
    } = usePreferences();
    const db = useSQLiteContext();
    const settingsService = SettingsServiceFactory.create(db);

    const handleOverdrawChange = async (value: boolean) => {
        try {
            await settingsService.set('allowOverdraw', value);
            setPreference('allowOverdraw', value);
        } catch (error) {
            console.error('Failed to update allowOverdraw setting:', error);
            Toast.show({
                type: 'error',
                props: {
                    text1: 'Error',
                    text2: 'Failed to update setting',
                },
            });
        }
    };

    console.log(allowOverdraw, 'VAL');

    const settingsItems: SettingsListItem[] = [
        {
            icon: <ScaleIcon width={20} height={20} stroke={'#9333ea'} />,
            title: 'Allow Overdraw',
            description: 'Enable overspending by allowing the account balance to drop below zero',
            customItem: (
                <Switch
                    value={allowOverdraw}
                    onValueChange={handleOverdrawChange}
                    activeText={''}
                    inActiveText={''}
                    backgroundActive='#9810fa'
                    backgroundInactive='#dab2ff'
                    circleSize={20}
                    barHeight={30}
                    circleBorderWidth={0}
                    switchWidthMultiplier={2.9}
                    containerStyle={{
                        transform: [{ scale: 0.8 }],
                    }}
                />
            ),
        },
    ];

    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <ExpoStatusBar style='dark' />
            <View className='w-full flex flex-row py-2.5 justify-between items-center relative px-5'>
                <TouchableOpacity
                    onPress={router.back}
                    className='bg-purple-50 px-4 py-2 flex items-center justify-center rounded-full'
                >
                    <ArrowLeftIcon stroke='#9333EA' strokeWidth={2.5} />
                </TouchableOpacity>

                <View className='absolute left-0 right-0 items-center'>
                    <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                        Account Settings
                    </Text>
                </View>
            </View>
            <View className='mt-5'>
                <SettingsList items={settingsItems} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 100,
        paddingHorizontal: 20,
    },
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
