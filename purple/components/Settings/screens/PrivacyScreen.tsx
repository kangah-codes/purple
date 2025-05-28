import { ArrowLeftIcon } from '@/components/SVG/24x24';
import { PinIcon, ScaleIcon } from '@/components/SVG/noscale';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import Switch from '@/components/Shared/molecules/Switch';
import { SafeAreaView, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { SettingsServiceFactory } from '@/lib/factory/SettingsFactory';
import { Portal } from '@gorhom/portal';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { usePreferences } from '../hooks';
import PinAccount from '../molecules/PinAccount';
import SettingsList from '../molecules/SettingsList';
import { SettingsListItem } from '../schema';

export default function PrivacyScreen() {
    const {
        preferences: { allowOverdraw },
        setPreference,
    } = usePreferences();
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();
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

    const settingsItems: SettingsListItem[] = [
        {
            icon: <ScaleIcon width={20} height={20} stroke={'#9333ea'} />,
            title: 'Usage Statistics',
            description: 'Allow Purple to track app metrics, to make the app better',
            customItem: <Switch value={allowOverdraw} onValueChange={handleOverdrawChange} />,
        },
        {
            icon: <ScaleIcon width={20} height={20} stroke={'#9333ea'} />,
            title: 'Send diagnostic data',
            description: 'Send diagnostic data and crash reports',
            customItem: <Switch value={allowOverdraw} onValueChange={handleOverdrawChange} />,
        },
    ];

    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <ExpoStatusBar style='dark' />
            <Portal>
                <PinAccount />
            </Portal>
            <View className='w-full flex flex-row py-2.5 justify-between items-center relative px-5'>
                <TouchableOpacity
                    onPress={router.back}
                    className='bg-purple-50 px-4 py-2 flex items-center justify-center rounded-full'
                >
                    <ArrowLeftIcon stroke='#9333EA' strokeWidth={2.5} />
                </TouchableOpacity>

                <View className='absolute left-0 right-0 items-center'>
                    <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                        Privacy & Security
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
