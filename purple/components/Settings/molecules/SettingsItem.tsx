import { ChevronRightIcon } from '@/components/SVG/icons/16x16';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { Href, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { SettingsListItem } from '../schema';

export default function SettingsItem({
    icon,
    title,
    link,
    callback,
    description,
    customItem,
    disabled,
    renderIcon,
}: SettingsListItem) {
    const router = useRouter();
    const handlePress = useCallback(() => {
        if (link) {
            router.push(link as Href<string>);
            return;
        }
        if (callback) callback();
    }, [link, callback]);

    return (
        <TouchableOpacity onPress={handlePress} disabled={disabled}>
            <View className='flex-row items-center justify-between py-4 w-full'>
                <View className='flex-row items-start space-x-2.5'>
                    {renderIcon ? (
                        renderIcon()
                    ) : (
                        <View className='items-center justify-center rounded-full border border-purple-300 w-[40px] h-[40px]'>
                            {icon}
                        </View>
                    )}

                    <View className='flex flex-col w-full max-w-[70%]'>
                        <Text style={satoshiFont.satoshiBold} className='text-base text-black'>
                            {title}
                        </Text>
                        <Text style={satoshiFont.satoshiMedium} className='text-sm text-black'>
                            {description}
                        </Text>
                    </View>
                </View>

                {customItem ? customItem() : <ChevronRightIcon stroke='#9333ea' />}
            </View>
        </TouchableOpacity>
    );
}
