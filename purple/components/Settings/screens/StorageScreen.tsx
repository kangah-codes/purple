import { ArrowLeftIcon } from '@/components/SVG/icons/24x24';
import { FloppyDiskIcon } from '@/components/SVG/icons/noscale';
import { SafeAreaView, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { SettingsServiceFactory } from '@/lib/factory/SettingsFactory';
import { Portal } from '@gorhom/portal';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useCallback } from 'react';
import { Alert, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { usePreferences } from '../hooks';
import PinAccount from '../molecules/PinAccount';
import SettingsList from '../molecules/SettingsList';
import { SettingsListItem } from '../schema';

export default function StorageScreen() {
    const {
        preferences: { hideCompletedPlans },
        setPreference,
    } = usePreferences();
    const db = useSQLiteContext();
    const settingsService = SettingsServiceFactory.create(db);

    const handleToggle = async (value: boolean) => {
        try {
            await settingsService.set('hideCompletedPlans', value);
            setPreference('hideCompletedPlans', value);
        } catch (error) {
            Toast.show({
                type: 'error',
                props: {
                    text1: 'Error',
                    text2: 'Failed to update setting',
                },
            });
        }
    };

    // async function exportBackup() {
    // const backupUri = `${FileSystem.documentDirectory}backup/mydb_backup.db`;
    // // Make sure backup exists
    // try {
    //     await FileSystem.copyAsync({
    //         from: `${FileSystem.documentDirectory}SQLite/purple_test_1.db`,
    //         to: backupUri,
    //     });
    //     // if (await Sharing.isAvailableAsync()) {
    //     //     await Sharing.shareAsync(backupUri);
    //     // } else {
    //     //     alert('Sharing is not available on this device');
    //     // }
    //     console.log('backup success');
    // } catch (error) {
    //     console.error('Export failed:', error);
    // }
    // }

    const settingsItems: SettingsListItem[] = [
        {
            icon: <FloppyDiskIcon width={20} height={20} stroke={'#9333ea'} />,
            title: 'Backup Data',
            description: 'Create a backup of your current data',
            // callback: backupDB,
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
                        Storage Settings
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
