import { SettingsCogIcon } from '@/components/SVG/24x24';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import { View } from '@/components/Shared/styled';
import { keyExtractor } from '@/lib/utils/number';
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, ListRenderItem } from 'react-native';
import { usePreferences } from '../hooks';
import { ProfilePageLinkProps } from '../schema';
import CurrencyOption from './CurrencyOption';
import ProfilePageLink from './ProfilePageLink';
import { AlertHexagonIcon, SafeIcon } from '@/components/SVG/noscale';
import * as WebBrowser from 'expo-web-browser';
import { Image } from 'expo-image';
import { currencies } from '@/lib/constants/currencies';

export default function ProfilePages() {
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();
    const {
        preferences: { currency },
    } = usePreferences();
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
            icon: <CurrencyOption code={currency} />,
            title: 'Default Currency',
            callback: () => setShowBottomSheetFlatList('preferences-currency', true),
            description: 'Select a default currency for all transactions',
            renderIcon: () => {
                const settingCurrency = currencies.find(
                    (cur) => cur.code === currency,
                ) as (typeof currencies)[number];
                const country = settingCurrency.locale.split('-')[1];
                return (
                    <Image
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 40,
                        }}
                        source={`https://globalartinc.github.io/round-flags/flags/${country}.svg`}
                        contentFit='cover'
                        transition={1000}
                    />
                );
            },
        },
        {
            icon: <SafeIcon width={20} height={20} stroke={'#9333ea'} />,
            title: 'Accounts',
            link: '/settings/account-settings',
            description: 'Manage account settings',
        },
        {
            icon: <SettingsCogIcon width={20} height={20} stroke={'#9333ea'} />,
            title: 'Categories',
            link: '/settings/transaction-categories',
            description: 'Manage transaction categories',
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
    },
});
