import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { BellIcon, SettingsCogIcon } from '@/components/SVG/icons/24x24';
import { DotsHorizontalIcon } from '@/components/SVG/icons/noscale';
import { satoshiFont } from '@/lib/constants/fonts';
import { router } from 'expo-router';
import React from 'react';

export default function IndexNavigationArea() {
    return (
        <View className='w-full flex flex-row justify-between items-center relative px-5'>
            <View className='bg-purple-50 px-4 py-2 flex items-center justify-center rounded-full'>
                <DotsHorizontalIcon stroke='#9333EA' strokeWidth={2.5} width={24} height={24} />
            </View>
            <View className='absolute left-0 right-0 items-center'>
                <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                    Home MALA NOTIFICA
                </Text>
            </View>

            <View className='flex flex-row space-x-2.5 items-center'>
                <TouchableOpacity
                    onPress={() => router.push('/settings')}
                    className='bg-purple-50 p-2 flex items-center justify-center rounded-full'
                >
                    <SettingsCogIcon stroke='#c27aff' strokeWidth={2} width={24} height={24} />
                </TouchableOpacity>
                <LinearGradient className='rounded-full relative' colors={['#c084fc', '#9333ea']}>
                    <TouchableOpacity
                        className='flex items-center justify-center rounded-full w-9 h-9'
                        onPress={() => router.push('/notifications')}
                    >
                        <BellIcon stroke={'#fff'} width={20} height={20} strokeWidth={2} />
                    </TouchableOpacity>
                    <View className='absolute px-1.5 py-0.5 rounded-full bg-red-500 -top-1 -right-1 flex items-center justify-center'>
                        <Text
                            style={satoshiFont.satoshiBlack}
                            className='text-[8px] leading-[12px] text-white'
                        >
                            9+
                        </Text>
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
}
