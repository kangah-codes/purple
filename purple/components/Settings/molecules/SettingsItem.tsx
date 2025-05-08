import { ChevronRightIcon } from '@/components/SVG/16x16';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { Href, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { SettingsListItem } from '../schema';
import { satoshiFont } from '@/lib/constants/fonts';

export default function SettingsItem({
    icon,
    title,
    link,
    callback,
    description,
    customItem,
}: SettingsListItem) {
    const router = useRouter();
    const handlePress = useCallback(() => {
        if (link) {
            router.push(link as Href<string>);
            return;
        }
        callback && callback();
    }, [link, callback]);

    return (
        <TouchableOpacity onPress={handlePress}>
            <View className='flex-row items-center justify-between py-4 w-full'>
                <View className='flex-row items-center space-x-2.5'>
                    <View className='items-center justify-center rounded-full border border-purple-300 p-2'>
                        {icon}
                    </View>
                    <View className='flex flex-col max-w-[75%]'>
                        <Text style={satoshiFont.satoshiBold} className='text-base text-black'>
                            {title}
                        </Text>
                        <Text style={satoshiFont.satoshiMedium} className='text-sm text-black'>
                            {description}
                        </Text>
                    </View>
                </View>

                {customItem ? customItem : <ChevronRightIcon stroke='#9333ea' />}
            </View>
        </TouchableOpacity>
    );
}
