import { ArrowLeftIcon } from '@/components/SVG/icons/24x24';
import { PinIcon, ScaleIcon } from '@/components/SVG/icons/noscale';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import Switch from '@/components/Shared/atoms/Switch';
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
import { useAnalytics } from '@/lib/hooks/useAnalytics';

export default function AccountsScreen() {
    const {
        preferences: { allowOverdraw },
        setPreference,
    } = usePreferences();
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();
    const db = useSQLiteContext();
    const settingsService = SettingsServiceFactory.create(db);
    const { logEvent } = useAnalytics();

    const handleOverdrawChange = async (value: boolean) => {
        try {
            await logEvent('settings_set', {
                setting: 'allowOverdraw',
                old_value: allowOverdraw,
                new_value: value,
            });
            await settingsService.set('allowOverdraw', value);
            setPreference('allowOverdraw', value);
        } catch {
            await logEvent('error_occurred', {
                error_type: 'SETTING_UPDATE_ERROR',
                context: `Failed to update ${allowOverdraw} setting:`,
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
            icon: <ScaleIcon width={20} height={20} stroke={'#9333ea'} />,
            title: 'Allow Overdraw',
            customItem: () => <Switch value={allowOverdraw} onValueChange={handleOverdrawChange} />,
        },
        {
            icon: <PinIcon width={20} height={20} stroke='#9333ea' />,
            title: 'Pinned Account',
            callback: () => setShowBottomSheetFlatList('preferences-pinned-account', true),
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
                        Account Settings
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
