import { TouchableOpacity, View, Text, LinearGradient } from '@/components/Shared/styled';
import React from 'react';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { useAccounts } from '../hooks';
import { groupAccountsByCategory } from '../utils';
import AccountGroupCard from './AccountGroupCard';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import { satoshiFont } from '@/lib/constants/fonts';
import { router } from 'expo-router';

export default function AccountsAccordion() {
        const { logEvent } = useAnalytics();
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

            <TouchableOpacity onPress={() => {
                logEvent('button_tap', {
                    button: 'create_account',
                    screen: 'accounts_screen',
                });
                router.push('/accounts/new-account');
            }}>
                <LinearGradient
                    className='rounded-full justify-center items-center p-4'
                    colors={['#c084fc', '#9333ea']}
                >
                    <Text style={satoshiFont.satoshiBold} className='text-sm text-white'>
                        Create Account
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}
