import { groupBy } from '@/lib/utils/helpers';
import { keyExtractor } from '@/lib/utils/number';
import { useCallback } from 'react';
import { ListRenderItem, StyleSheet } from 'react-native';
import { useAccountStore } from '../hooks';
import { Account } from '../schema';
import AccountCard from './AccountCard';
import React from 'react';
import { FlashList } from '@shopify/flash-list';
import { groupAccountsByCategory } from '../utils';

export default function AccountsAccordion() {
    const { accounts } = useAccountStore();
    const renderItem = useCallback(
        ({ item }: { item: { groupName: string; currency?: string; accounts: Account[] } }) => (
            <AccountCard groupName={item.groupName} accounts={item.accounts} />
        ),
        [],
    );

    return (
        <FlashList
            estimatedItemSize={50}
            data={Object.entries(groupAccountsByCategory(accounts)).map(([key, value]) => {
                const [category, currency] = key.split('_');
                return {
                    groupName: category,
                    currency: currency,
                    accounts: value,
                };
            })}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
        />
    );
}
