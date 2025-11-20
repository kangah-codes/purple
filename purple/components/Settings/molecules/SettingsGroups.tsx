import {
    AlertHexagonIcon,
    CashIcon,
    ClosedLockIcon,
    CoinSwapIcon,
    ExternalLinkIcon,
    FlaskIcon,
    PiggyBankIcon,
    SafeIcon,
} from '@/components/SVG/icons/noscale';
import { BellIcon } from '@/components/SVG/icons/24x24';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { ScrollView } from 'react-native';
import { SettingsListItem } from '../schema';
import SettingsGroup from './SettingsGroup';

export default function SettingsGroups() {
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
            icon: <PiggyBankIcon width={18} height={18} stroke={'#9333ea'} />,
            title: 'Plans',
            link: '/settings/plan-settings',
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
        </ScrollView>
    );
}
