import { ArrowLeftIcon } from '@/components/SVG/icons/24x24';
import { BarLineChartIcon, PaperPlaneIcon } from '@/components/SVG/icons/noscale';
import Switch from '@/components/Shared/molecules/Switch';
import { SafeAreaView, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { SettingsServiceFactory } from '@/lib/factory/SettingsFactory';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { Portal } from '@gorhom/portal';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React from 'react';
import { Alert, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { usePreferences } from '../hooks';
import PinAccount from '../molecules/PinAccount';
import SettingsList from '../molecules/SettingsList';
import { SettingsListItem } from '../schema';

export default function PrivacyScreen() {
    const { preferences, setPreference } = usePreferences();
    const { trackUsageStatistics, sendDiagnosticData } = preferences;
    const db = useSQLiteContext();
    const settingsService = SettingsServiceFactory.create(db);
    const { logEvent } = useAnalytics();
    const handleToggle = async (
        key: 'trackUsageStatistics' | 'sendDiagnosticData',
        value: boolean,
    ) => {
        const isDisabling = !value;
        const messages: Record<
            'trackUsageStatistics' | 'sendDiagnosticData',
            { enable: string; disable: string }
        > = {
            trackUsageStatistics: {
                enable: 'Allowing usage tracking helps us improve features based on how you use the app.',
                disable:
                    'Disabling usage tracking means we won’t be able to improve your experience based on how the app is used.',
            },
            sendDiagnosticData: {
                enable: 'Sending diagnostic data and crash reports helps us fix bugs faster and improve performance.',
                disable:
                    'Disabling diagnostic data means we won’t receive crash reports, which may slow down bug fixes.',
            },
        };

        const showConfirmation = isDisabling && messages[key];

        if (showConfirmation) {
            Alert.alert('Are you sure?', messages[key].disable, [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Disable',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logEvent('settings_set', {
                                setting: key,
                                old_value: preferences[key],
                                new_value: value,
                            });
                            await settingsService.set(key, value);
                            setPreference(key, value);
                        } catch (error) {
                            console.error(`Failed to update ${key} setting:`, error);
                            await logEvent('error_occurred', {
                                error_type: 'SETTING_UPDATE_ERROR',
                                context: `Failed to update ${key} setting:`,
                                severity: 'medium',
                            });
                            Toast.show({
                                type: 'error',
                                props: {
                                    text1: 'Error',
                                    text2: `Failed to update setting`,
                                },
                            });
                        }
                    },
                },
            ]);
        } else {
            try {
                await settingsService.set(key, value);
                setPreference(key, value);
                if (value) {
                    Toast.show({
                        type: 'success',
                        props: {
                            text1: 'Preference updated',
                            text2: messages[key]?.enable,
                        },
                    });
                }
            } catch (error) {
                console.error(`Failed to update ${key} setting:`, error);
                await logEvent('error_occurred', {
                    error_type: 'SETTING_UPDATE_ERROR',
                    context: `Failed to update ${key} setting:`,
                    severity: 'medium',
                });
                Toast.show({
                    type: 'error',
                    props: {
                        text1: 'Error',
                        text2: `Failed to update setting`,
                    },
                });
            }
        }
    };

    const settingsItems: SettingsListItem[] = [
        {
            icon: <BarLineChartIcon width={20} height={20} stroke='#9333ea' />,
            title: 'Usage statistics',
            description:
                'Allow Purple to track app metrics and usage patterns to improve features and user experience',
            customItem: () => (
                <Switch
                    value={trackUsageStatistics}
                    onValueChange={(value) => handleToggle('trackUsageStatistics', value)}
                />
            ),
        },
        {
            icon: <PaperPlaneIcon width={20} height={20} stroke='#9333ea' />,
            title: 'Send diagnostic data',
            description:
                'Send diagnostic data and crash reports to help improve performance and reliability',
            customItem: () => (
                <Switch
                    value={sendDiagnosticData}
                    onValueChange={(value) => handleToggle('sendDiagnosticData', value)}
                />
            ),
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
