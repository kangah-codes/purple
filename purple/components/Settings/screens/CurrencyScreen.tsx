import { ArrowLeftIcon } from '@/components/SVG/icons/24x24';
import { CoinSwapIcon } from '@/components/SVG/icons/noscale';
import FlagIcon from '@/components/Shared/atoms/FlagIcon';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import Switch from '@/components/Shared/molecules/Switch';
import { SafeAreaView, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { currencies } from '@/lib/constants/currencies';
import { satoshiFont } from '@/lib/constants/fonts';
import { CurrencyRates } from '@/lib/services/CurrencyService';
import { nativeStorage } from '@/lib/utils/storage';
import { Portal } from '@gorhom/portal';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import { usePreferences } from '../hooks';
import CurrencyOption from '../molecules/CurrencyOption';
import PinAccount from '../molecules/PinAccount';
import SettingsList from '../molecules/SettingsList';
import { SettingsListItem } from '../schema';

export default function CurrencyScreen() {
    const {
        preferences: { currency },
    } = usePreferences();
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();
    const exchangeRates = nativeStorage.getItem<CurrencyRates>('currency-exchange-rates');
    const settingsItems: SettingsListItem[] = [
        {
            icon: <CurrencyOption code={currency} />,
            title: 'Default Currency',
            callback: () => setShowBottomSheetFlatList('preferences-currency', true),
            description: 'Select a default currency for all transactions',
            renderIcon: () => {
                const settingCurrency = currencies.find(
                    (cur) => cur.code === currency,
                ) as (typeof currencies)[number];
                return (
                    <View className='w-[40] h-[40] flex items-center justify-center'>
                        <FlagIcon currency={settingCurrency} />
                    </View>
                );
            },
        },
        ...(Boolean(exchangeRates)
            ? [
                  {
                      icon: <CoinSwapIcon width={20} height={20} stroke={'#9333ea'} />,
                      title: 'Enable Currency Conversion',
                      description: 'Auto-convert amounts between different currencies',
                      customItem: () => <Switch value={false} onValueChange={() => {}} disabled />,
                  },
                  {
                      icon: <CoinSwapIcon width={20} height={20} stroke={'#9333ea'} />,
                      title: 'Exchange Rates',
                      link: '/settings/currencies/exchange-rates',
                      description: 'View latest exchange rates',
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
                        Currency Settings
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
