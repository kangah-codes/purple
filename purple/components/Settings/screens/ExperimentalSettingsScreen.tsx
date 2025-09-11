import { ArrowLeftIcon } from '@/components/SVG/icons/24x24';
import { FloppyDiskIcon, RefreshIcon } from '@/components/SVG/icons/noscale';
import { SafeAreaView, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React from 'react';
import { Alert, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import SettingsList from '../molecules/SettingsList';
import { SettingsListItem } from '../schema';
import { exportDatabase, importDatabase } from '../utils';

export default function ExperimentalSettingsScreen() {
    const { logEvent } = useAnalytics();

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
                            const restored = await importDatabase();

                            if (restored) {
                                Toast.show({
                                    type: 'success',
                                    props: {
                                        text1: 'Success',
                                        text2: 'Database restored successfully. Please restart the app.',
                                    },
                                });
                            } else {
                                Toast.show({
                                    type: 'error',
                                    props: {
                                        text1: 'Error',
                                        text2: 'No backup file selected or found',
                                    },
                                });
                            }
                        } catch (error) {
                            await logEvent('error_occurred', {
                                error_type: 'DATABASE_RESTORE_ERROR',
                                context: 'Failed to restore database',
                                severity: 'high',
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
            icon: <FloppyDiskIcon width={20} height={20} stroke={'#9333ea'} />,
            title: 'Backup Database',
            description: 'Backup your data to a file',
            callback: exportDatabase,
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
