import { Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import React from 'react';
import { FlatList, ListRenderItem } from 'react-native';
import { SettingsListItem } from '../schema';
import SettingsItem from './SettingsItem';

type SettingsGroupProps = {
    groupName: string;
    items: SettingsListItem[];
};

export default function SettingsGroup({ groupName, items }: SettingsGroupProps) {
    const ItemSeparator = () => <View className='h-[0.5px] border-b border-purple-100 my-4' />;
    const renderItem: ListRenderItem<SettingsListItem> = ({ item }) => <SettingsItem {...item} />;

    return (
        <View className='w-full flex flex-col space-y-2.5'>
            <Text style={satoshiFont.satoshiBold} className='text-sm text-purple-500 px-5'>
                {groupName}
            </Text>

            <View className='bg-purple-50 rounded-3xl p-4 border border-purple-100'>
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    ItemSeparatorComponent={ItemSeparator}
                    scrollEnabled={false}
                    keyExtractor={(item) => item.title}
                />
            </View>
        </View>
    );
}
