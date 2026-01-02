import { ArrowLeftIcon } from '@/components/SVG/icons/24x24';
import { FloppyDiskIcon, RefreshIcon } from '@/components/SVG/icons/noscale';
import { SafeAreaView, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { Portal } from '@gorhom/portal';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React from 'react';
import { Alert, Platform, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import SettingsList from '../molecules/SettingsList';
import UpdateFrequency from '../molecules/UpdateFrequency';
import { SettingsListItem } from '../schema';
import { exportDatabase } from '../helpers/exportDb';
import { importDatabase } from '../helpers/importDb';
import { installExportLogger } from '@/lib/utils/exportLogger';

export default function ExperimentalSettingsScreen() {
    const { logEvent } = useAnalytics();
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();
    const db = useSQLiteContext();

    const handleExportLogs = async () => {
        try {
            const logger = installExportLogger({ enabled: true });
            const result = await logger.exportLogs();

            if (result.success) {
                Toast.show({
                    type: 'success',
                    props: {
                        text1: 'Success',
                        text2:
                            Platform.OS === 'android'
                                ? 'Logs exported successfully'
                                : 'Logs saved to Files app',
                    },
                });
            } else {
                Toast.show({
                    type: 'error',
                    props: {
                        text1: 'Error',
                        text2: result.error || 'Failed to export logs',
                    },
                });
            }
        } catch (error) {
            console.log(error);
            Toast.show({
                type: 'error',
                props: {
                    text1: 'Error',
                    text2: 'Failed to export logs',
                },
            });
        }
    };

    const handleBackup = async () => {
        try {
            const { success, error } = await exportDatabase(db);

            if (success) {
                Toast.show({
                    type: 'success',
                    props: {
                        text1: 'Success',
                        text2: 'Database exported successfully',
                    },
                });
            } else {
                console.log(error);
                Toast.show({
                    type: 'error',
                    props: {
                        text1: 'Error',
                        text2: error || 'Failed to export database',
                    },
                });
            }
        } catch (error) {
            await logEvent('error_occurred', {
                error_type: 'DATABASE_EXPORT_ERROR',
                context: 'Failed to export database',
                severity: 'high',
                error,
            });
            Toast.show({
                type: 'error',
                props: {
                    text1: 'Error',
                    text2: 'Failed to export database',
                },
            });
        }
    };

    const handleRestore = async () => {
        Alert.alert(
            'Restore Database',
            'This will overwrite your existing data. Are you sure you want to continue?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Restore',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { success, error } = await importDatabase(db);

                            if (success) {
                                Toast.show({
                                    type: 'success',
                                    props: {
                                        text1: 'Success',
                                        text2: 'Data restored successfully',
                                    },
                                });
                            } else {
                                console.log(error);
                                Toast.show({
                                    type: 'error',
                                    props: {
                                        text1: 'Error',
                                        text2: error || 'Failed to restore database',
                                    },
                                });
                            }
                        } catch (error) {
                            await logEvent('error_occurred', {
                                error_type: 'DATABASE_RESTORE_ERROR',
                                context: 'Failed to restore database',
                                severity: 'high',
                                error,
                            });
                            Toast.show({
                                type: 'error',
                                props: {
                                    text1: 'Error',
                                    text2: 'Failed to restore database',
                                },
                            });
                        }
                    },
                },
            ],
        );
    };

    const settingsItems: SettingsListItem[] = [
        {
            icon: <RefreshIcon width={20} height={20} stroke={'#9333ea'} />,
            title: 'Update Check Frequency',
            description: 'Choose when to check for app updates',
            callback: () => setShowBottomSheetFlatList('preferences-update-frequency', true),
        },
        {
            icon: <FloppyDiskIcon width={20} height={20} stroke={'#9333ea'} />,
            title: 'Export App Logs',
            description: 'Export a log file for debugging production builds',
            callback: handleExportLogs,
        },
        {
            icon: <FloppyDiskIcon width={20} height={20} stroke={'#9333ea'} />,
            title: 'Backup Database',
            description: 'Backup your data to a file',
            callback: handleBackup,
        },
        {
            icon: <RefreshIcon width={20} height={20} stroke={'#9333ea'} />,
            title: 'Restore Database',
            description: 'Restore your data from a backup file. This will overwrite existing data.',
            callback: handleRestore,
        },
    ];

    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <ExpoStatusBar style='dark' />
            <Portal>
                <UpdateFrequency />
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
                        Experimental Features
                    </Text>
                </View>
            </View>

            <View>
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
