import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { ArrowLeftIcon } from '@/components/SVG/icons/24x24';
import { satoshiFont } from '@/lib/constants/fonts';
import { router } from 'expo-router';
import React from 'react';

export default function NotificationsNavigationArea() {
    return (
        <View className='w-full flex flex-row justify-between items-center relative px-5'>
            <TouchableOpacity
                onPress={router.back}
                className='bg-purple-50 px-4 py-2 flex items-center justify-center rounded-full'
            >
                <ArrowLeftIcon stroke='#9333EA' strokeWidth={2.5} width={24} height={24} />
            </TouchableOpacity>
            <View className='absolute left-0 right-0 items-center'>
                <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                    Notifications
                </Text>
            </View>
        </View>
    );
}
