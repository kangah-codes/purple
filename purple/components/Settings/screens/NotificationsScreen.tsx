import { ArrowLeftIcon } from '@/components/SVG/icons/24x24';
import { BellIcon, CoinsStackedIcon, EyeCloseIcon } from '@/components/SVG/icons/noscale';
import Switch from '@/components/Shared/atoms/Switch';
import { SafeAreaView, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { SettingsServiceFactory } from '@/lib/factory/SettingsFactory';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
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
import { SettingsListItem, UserPreferences } from '../schema';

export default function NotificationsScreen() {
    const { preferences, setPreference } = usePreferences();
    const db = useSQLiteContext();
    const settingsService = SettingsServiceFactory.create(db);
    const { logEvent } = useAnalytics();

    const handleToggle = async <K extends keyof UserPreferences>(key: K, value: boolean) => {
        try {
            await logEvent('settings_set', {
                setting: key,
                old_value: preferences[key],
                new_value: value,
            });
            await settingsService.set(key, value as UserPreferences[K]);
            setPreference(key, value);
        } catch (error) {
            console.error('Failed to update setting', error);
            await logEvent('error_occurred', {
                error_type: 'SETTING_UPDATE_ERROR',
                context: `Failed to update ${key} setting: ${(error as Error).message}`,
                severity: 'medium',
            });
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
            icon: <BellIcon width={20} height={20} stroke={'#9333ea'} />,
            title: 'Push Notifications',
            description: 'Receive notifications for important updates and reminders',
            customItem: () => (
                <Switch
                    value={preferences.pushNotificationsEnabled}
                    onValueChange={(value) => handleToggle('pushNotificationsEnabled', value)}
                />
            ),
        },
        ...(preferences.pushNotificationsEnabled
            ? [
                  {
                      icon: <CoinsStackedIcon width={20} height={20} stroke='#9333ea' />,
                      title: 'Daily transaction reminder',
                      description:
                          'Get reminded towards the end of each day to log your transactions',
                      customItem: () => (
                          <Switch
                              value={preferences.dailyNotificationsEnabled}
                              onValueChange={(value) =>
                                  handleToggle('dailyNotificationsEnabled', value)
                              }
                          />
                      ),
                  },
              ]
            : []),
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
                        Notification Settings
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
