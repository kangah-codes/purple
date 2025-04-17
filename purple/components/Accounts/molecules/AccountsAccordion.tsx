import { keyExtractor } from '@/lib/utils/number';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useEffect } from 'react';
import { useAccountStore } from '../hooks';
import { Account } from '../schema';
import { groupAccountsByCategory } from '../utils';
import AccountCard from './AccountCard';

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
        <FlashList
            estimatedItemSize={50}
            data={data}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
        />
    );
}
