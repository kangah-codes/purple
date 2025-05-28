import { SafeAreaView, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { Portal } from '@gorhom/portal';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { ArrowLeftIcon } from '@/components/SVG/24x24';
import { BarLineChartIcon, PaperPlaneIcon } from '@/components/SVG/noscale';
import Switch from '@/components/Shared/molecules/Switch';
import { satoshiFont } from '@/lib/constants/fonts';
import { SettingsServiceFactory } from '@/lib/factory/SettingsFactory';
import { usePreferences } from '../hooks';
import PinAccount from '../molecules/PinAccount';
import SettingsList from '../molecules/SettingsList';
import { SettingsListItem, UserPreferences } from '../schema';

export default function PrivacyScreen() {
    const {
        preferences: { trackUsageStatistics, sendDiagnosticData },
        setPreference,
    } = usePreferences();
    const db = useSQLiteContext();
    const settingsService = SettingsServiceFactory.create(db);

    const handleToggle = async (key: keyof UserPreferences, value: boolean) => {
        try {
            await settingsService.set(key, value);
            setPreference(key, value);
        } catch (error) {
            console.error(`Failed to update ${key} setting:`, error);
            Toast.show({
                type: 'error',
                props: {
                    text1: 'Error',
                    text2: `Failed to update setting`,
                },
            });
        }
    };

    const settingsItems: SettingsListItem[] = [
        {
            icon: <BarLineChartIcon width={20} height={20} stroke='#9333ea' />,
            title: 'Usage statistics',
            description:
                'Allow Purple to track app metrics and usage patterns to improve features and user experience',
            customItem: (
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
            customItem: (
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
