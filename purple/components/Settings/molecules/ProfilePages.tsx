import { SettingsCogIcon } from '@/components/SVG/icons/24x24';
import {
    AlertHexagonIcon,
    CashIcon,
    ClosedLockIcon,
    PiggyBankIcon,
    SafeIcon,
} from '@/components/SVG/icons/noscale';
import { View } from '@/components/Shared/styled';
import { keyExtractor } from '@/lib/utils/number';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';
import { ProfilePageLinkProps } from '../schema';
import ProfilePageLink from './ProfilePageLink';
import SettingsFooter from './SettingsFooter';

export default function ProfilePages() {
    const renderItem: ListRenderItem<ProfilePageLinkProps> = useCallback(
        ({ item }) => (
            <ProfilePageLink
                icon={item.icon}
                title={item.title}
                link={item.link}
                callback={item.callback}
                description={item.description}
                renderIcon={item.renderIcon}
            />
        ),
        [],
    );
    const itemSeparator = useCallback(
        () => <View className='border-b border-purple-200 h-[0.5px]' />,
        [],
    );

    const profilePages: ProfilePageLinkProps[] = [
        {
            icon: <CashIcon width={20} height={20} stroke={'#9333ea'} />,
            title: 'Currency',
            link: '/settings/currencies/currency-settings',
            description: 'Manage currency settings',
        },
        {
            icon: <SafeIcon width={20} height={20} stroke={'#9333ea'} />,
            title: 'Accounts',
            link: '/settings/account-settings',
            description: 'Manage account settings',
        },
        {
            icon: <PiggyBankIcon width={20} height={20} stroke={'#9333ea'} />,
            title: 'Plans',
            link: '/settings/plan-settings',
            description: 'Manage plan settings',
        },
        {
            icon: <SettingsCogIcon width={20} height={20} stroke={'#9333ea'} />,
            title: 'Categories',
            link: '/settings/transaction-categories',
            description: 'Manage transaction categories',
        },
        {
            icon: <ClosedLockIcon width={20} height={20} stroke={'#9333ea'} />,
            title: 'Privacy & Security',
            link: '/settings/privacy-settings',
            description: 'Manage privacy & security settings',
        },
        {
            icon: <AlertHexagonIcon width={20} height={20} stroke={'#9333ea'} />,
            title: 'Report a bug',
            callback: () => WebBrowser.openBrowserAsync('https://purpleapp.featurebase.app/'),
            description: 'Report a bug in the app or request a feature',
        },
    ];

    return (
        <FlatList
            data={profilePages}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={true}
            renderItem={renderItem}
            ItemSeparatorComponent={itemSeparator}
            contentContainerStyle={styles.flatlistContainer}
            ListFooterComponent={<SettingsFooter />}
        />
    );
}

const styles = StyleSheet.create({
    flatlistContainer: {
        width: '100%',
        paddingHorizontal: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 70,
    },
});
