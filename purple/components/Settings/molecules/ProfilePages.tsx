import MegaphoneIcon, { SettingsCogIcon, ShieldTickIcon } from '@/components/SVG/24x24';
import { UserCircleIcon } from '@/components/SVG/noscale';
import { View } from '@/components/Shared/styled';
import { keyExtractor } from '@/lib/utils/number';
import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';
import ProfilePageLink from './ProfilePageLink';
import CurrencyOption from './CurrencyOption';
import { ProfilePageLinkProps } from '../schema';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import SelectCurrency from './SelectCurrency';
import { usePreferences } from '../hooks';

export default function ProfilePages() {
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();
    const { currency } = usePreferences();
    const renderItem: ListRenderItem<ProfilePageLinkProps> = useCallback(
        ({ item }) => (
            <ProfilePageLink
                icon={item.icon}
                title={item.title}
                link={item.link}
                callback={item.callback}
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
        },
        // {
        //     icon: <SettingsCogIcon width={20} height={20} stroke={'#9333ea'} />,
        //     title: 'Categories',
        //     link: '/categories',
        //     callback: () => alert('NME'),
        // },
    ];

    return (
        <>
            <FlatList
                data={profilePages}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={true}
                renderItem={renderItem}
                scrollEnabled={false}
                ItemSeparatorComponent={itemSeparator}
                contentContainerStyle={styles.flatlistContainer}
            />
        </>
    );
}

const styles = StyleSheet.create({
    flatlistContainer: {
        width: '100%',
        marginVertical: 20,
        paddingHorizontal: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
