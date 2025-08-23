import { keyExtractor } from '@/lib/utils/number';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useEffect } from 'react';
import { useAccountStore } from '../hooks';
import { Account } from '../schema';
import { groupAccountsByCategory } from '../utils';
import AccountCard from './AccountCard';
import AccountGroupCard from './AccountGroupCard';
import { View } from '@/components/Shared/styled';

export default function AccountsAccordion() {
    const { accounts } = useAccountStore();
    const renderItem = useCallback(
        ({ item }: { item: { groupName: string; currency?: string; accounts: Account[] } }) => (
            <AccountCard groupName={item.groupName} accounts={item.accounts} />
        ),
        [],
    );

    const groupedAccounts = groupAccountsByCategory(accounts);
    const data = Object.entries(groupedAccounts)
        .map(([key, value]) => {
            const [category, currency] = key.split('_');
            return {
                groupName: category,
                currency: currency,
                accounts: value,
            };
        })
        .filter((item) => item.accounts && item.accounts.length > 0);

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
