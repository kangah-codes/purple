import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { ChevronRightIcon } from '@/components/SVG/16x16';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import React, { useCallback } from 'react';
import { Href, useRouter } from 'expo-router';
import { ProfilePageLinkProps } from '../schema';

export default function ProfilePageLink({ icon, title, link, callback }: ProfilePageLinkProps) {
    const router = useRouter();

    const handlePress = useCallback(() => {
        if (link) {
            router.push(link as Href<string>);
            return;
        }
        callback();
    }, [link, callback]);

    return (
        <TouchableOpacity onPress={handlePress}>
            <View className='flex-row items-center justify-between py-5 w-full'>
                <View className='flex-row items-center space-x-2.5'>
                    <View className='items-center justify-center'>{icon}</View>
                    <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-base text-black'>
                        {title}
                    </Text>
                </View>

                <ChevronRightIcon stroke='#9333ea' />
            </View>
        </TouchableOpacity>
    );
}
