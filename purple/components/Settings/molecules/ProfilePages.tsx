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
import { SafeIcon } from '@/components/SVG/noscale';

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
            />
        ),
        [],
    );
    const itemSeparator = useCallback(
        () => <View className='border-b border-purple-100 h-1' />,
        [],
    );

    const profilePages: ProfilePageLinkProps[] = [
        {
            icon: <CurrencyOption code={currency} />,
            title: 'Default Currency',
            callback: () => setShowBottomSheetFlatList('preferences-currency', true),
            description: 'Select a default currency for all transactions',
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
            callback: () => alert('NME'),
            description: 'Manage transaction categories',
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
