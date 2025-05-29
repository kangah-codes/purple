import { ArrowLeftIcon, PlusIcon } from '@/components/SVG/icons/24x24';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { Link, router } from 'expo-router';
import React from 'react';
import { useAccountStore } from '../hooks';

export default function AccountNavigationArea() {
    const { currentAccount } = useAccountStore();

    if (!currentAccount) return null;

    return (
        <View className='w-full flex flex-row py-2.5 justify-between items-center relative px-5'>
            <TouchableOpacity
                onPress={router.back}
                className='bg-purple-100 px-4 py-2 flex items-center justify-center rounded-full'
            >
                <ArrowLeftIcon stroke='#9333EA' strokeWidth={2.5} />
            </TouchableOpacity>

            <View className='absolute left-0 right-0 items-center'>
                <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                    {truncateStringIfLongerThan(currentAccount.name as string, 20)}
                </Text>
            </View>
            <Link
                href={{
                    pathname: '/transactions/new-transaction',
                    params: {
                        accountId: currentAccount.id,
                    },
                }}
            >
                <View className='bg-purple-600 px-2 py-2 flex items-center justify-center rounded-full'>
                    <PlusIcon stroke={'#fff'} />
                </View>
            </Link>
        </View>
    );
}
