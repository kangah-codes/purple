import {
    AlertHexagonIcon,
    CashIcon,
    ClosedLockIcon,
    CoinSwapIcon,
    ExternalLinkIcon,
    FlaskIcon,
    SafeIcon,
} from '@/components/SVG/icons/noscale';
import { BellIcon } from '@/components/SVG/icons/24x24';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { ScrollView } from 'react-native';
import { SettingsListItem } from '../schema';
import SettingsGroup from './SettingsGroup';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import pkg from '../../../package.json';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { useFeatureFlag } from '@/lib/hooks/useFeatureFlags';

export default function SettingsGroups() {
    const { flush, flushQueue } = useAnalytics();
    const showAnalyticsDebug = useFeatureFlag('analytics_debug');

    const generalSettings: SettingsListItem[] = [
        {
            icon: <CashIcon width={18} height={18} stroke={'#9333ea'} />,
            title: 'Currency',
            link: '/settings/currencies/currency-settings',
        },
        {
            icon: <SafeIcon width={18} height={18} stroke={'#9333ea'} />,
            title: 'Accounts',
            link: '/settings/account-settings',
        },
        {
            icon: <CoinSwapIcon width={18} height={18} stroke={'#9333ea'} />,
            title: 'Transactions',
            link: '/settings/transactions',
        },
    ];

    const securitySettings: SettingsListItem[] = [
        {
            icon: <ClosedLockIcon width={18} height={18} stroke={'#9333ea'} />,
            title: 'Privacy & Security',
            link: '/settings/privacy-settings',
        },
        {
            icon: <BellIcon width={18} height={18} stroke={'#9333ea'} />,
            title: 'Notifications',
            link: '/settings/notifications',
        },
    ];

    const otherSettings: SettingsListItem[] = [
        {
            icon: <FlaskIcon width={18} height={18} stroke={'#9333ea'} />,
            title: 'Experimental',
            link: '/settings/experimental',
        },
        {
            icon: <AlertHexagonIcon width={18} height={18} stroke={'#9333ea'} />,
            title: 'Report a bug',
            callback: () => WebBrowser.openBrowserAsync('https://purpleapp.featurebase.app/'),
            customItem: () => (
                <ExternalLinkIcon width={16} height={16} stroke={'#9333ea'} strokeWidth={2.8} />
            ),
        },
    ];

    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: 150,
                gap: 20,
            }}
            showsVerticalScrollIndicator={false}
            bounces={true}
            alwaysBounceVertical={true}
        >
            <SettingsGroup groupName='General' items={generalSettings} />
            <SettingsGroup groupName='Security & Notifications' items={securitySettings} />
            <SettingsGroup groupName='Other' items={otherSettings} />
            <View className='flex flex-col'>
                <View className='flex flex-row items-center justify-center'>
                    <Text
                        style={satoshiFont.satoshiBold}
                        className='text-xs text-purple-500 px-2.5'
                    >
                        Purple v{pkg.appVersion}
                    </Text>
                </View>

                <View className=''>
                    {showAnalyticsDebug && (
                        <>
                            <TouchableOpacity
                                className='items-center self-center justify-center px-4 mt-2.5'
                                onPress={flush}
                            >
                                <LinearGradient
                                    className='flex items-center justify-center rounded-full px-5 w-[200] h-[50]'
                                    colors={['#497d00', '#3c6300']}
                                >
                                    <Text
                                        style={satoshiFont.satoshiBlack}
                                        className='text-white text-center'
                                    >
                                        Flush Analytics
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className='items-center self-center justify-center px-4 mt-2.5'
                                onPress={flushQueue}
                            >
                                <LinearGradient
                                    className='flex items-center justify-center rounded-full px-5 w-[200] h-[50]'
                                    colors={['#00a6f4', '#0069a8']}
                                >
                                    <Text
                                        style={satoshiFont.satoshiBlack}
                                        className='text-white text-center'
                                    >
                                        Clear Analytics
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}
