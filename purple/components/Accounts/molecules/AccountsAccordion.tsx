import { View } from '@/components/Shared/styled';
import React from 'react';
import { useAccounts, useAccountStore } from '../hooks';
import { groupAccountsByCategory } from '../utils';
import AccountGroupCard from './AccountGroupCard';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';

export default function AccountsAccordion() {
    const { data: accounts, refetch } = useAccounts({
        requestQuery: {},
    });
    useRefreshOnFocus(refetch);

    const groupedAccounts = groupAccountsByCategory(accounts?.data ?? []);

    console.log(accounts, 'ACCOUNTS');

    return (
        <View className='px-5 flex flex-col space-y-5'>
            {Object.keys(groupedAccounts).map((key) => (
                <View key={key}>
                    <AccountGroupCard group={key} accounts={groupedAccounts[key]} />
                </View>
            ))}
        </View>
    );
}
