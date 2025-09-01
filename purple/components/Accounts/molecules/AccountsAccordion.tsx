import { TouchableOpacity, View, Text } from '@/components/Shared/styled';
import React from 'react';
import { useAccounts, useAccountStore } from '../hooks';
import { groupAccountsByCategory } from '../utils';
import AccountGroupCard from './AccountGroupCard';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import { satoshiFont } from '@/lib/constants/fonts';
import { router } from 'expo-router';

export default function AccountsAccordion() {
    const { data: accounts, refetch } = useAccounts({
        requestQuery: {},
    });
    useRefreshOnFocus(refetch);

    const groupedAccounts = groupAccountsByCategory(accounts?.data ?? []);

    return (
        <View className='px-5 flex flex-col space-y-5 mt-5'>
            {Object.keys(groupedAccounts).map((key) => (
                <View key={key}>
                    <AccountGroupCard group={key} accounts={groupedAccounts[key]} />
                </View>
            ))}

            <TouchableOpacity
                className='bg-purple-50/50 p-4 flex items-center justify-center rounded-full'
                style={{
                    borderStyle: 'dashed',
                    borderWidth: 1,
                    borderColor: '#dab2ff',
                }}
                onPress={() => router.push('/accounts/new-acount')}
            >
                <Text style={satoshiFont.satoshiBold} className='text-sm text-purple-700'>
                    Create Account
                </Text>
            </TouchableOpacity>
        </View>
    );
}
