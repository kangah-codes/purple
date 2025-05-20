import { ChevronRightIcon } from '@/components/SVG/16x16';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { Href, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ProfilePageLinkProps } from '../schema';

export default function ProfilePageLink({
    icon,
    title,
    link,
    callback,
    renderIcon,
    description,
}: ProfilePageLinkProps) {
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
                    {renderIcon ? (
                        renderIcon()
                    ) : (
                        <View className='items-center justify-center rounded-full border border-purple-300 w-[40px] h-[40px]'>
                            {icon}
                        </View>
                    )}

                    <View className='flex flex-col max-w-[90%]'>
                        <Text style={satoshiFont.satoshiBold} className='text-base text-black'>
                            {title}
                        </Text>
                        <Text style={satoshiFont.satoshiMedium} className='text-sm text-black'>
                            {description}
                        </Text>
                    </View>
                </View>

                <ChevronRightIcon stroke='#9333ea' />
            </View>
        </TouchableOpacity>
    );
}
