import { View } from '@/components/Shared/styled';
import { keyExtractor } from '@/lib/utils/number';
import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';
import { SettingsListItem } from '../schema';
import SettingsItem from './SettingsItem';

type SettingsListProps = {
    items: SettingsListItem[];
};

export default function SettingsList({ items }: SettingsListProps) {
    const renderItem: ListRenderItem<SettingsListItem> = useCallback(
        ({ item }) => (
            <SettingsItem
                icon={item.icon}
                title={item.title}
                link={item.link}
                callback={item.callback}
                description={item.description}
                customItem={item.customItem}
            />
        ),
        [],
    );
    const itemSeparator = useCallback(
        () => <View className='border-b border-purple-100 h-[0.5]' />,
        [],
    );

    return (
        <FlatList
            data={items}
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
