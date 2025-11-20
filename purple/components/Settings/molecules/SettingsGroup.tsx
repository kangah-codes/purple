import { Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import React from 'react';
import { SettingsListItem } from '../schema';
import SettingsItem from './SettingsItem';

type SettingsGroupProps = {
    groupName: string;
    items: SettingsListItem[];
};

export default function SettingsGroup({ groupName, items }: SettingsGroupProps) {
    return (
        <View className='w-full flex flex-col space-y-2.5'>
            <Text style={satoshiFont.satoshiBold} className='text-base text-black px-2.5'>
                {groupName}
            </Text>

            <View className='flex flex-col bg-red-100 rounded-3xl p-5 space-y-2.5'>
                {items.map((item) => (
                    <SettingsItem key={item.title} {...item} />
                ))}
            </View>
        </View>
    );
}
