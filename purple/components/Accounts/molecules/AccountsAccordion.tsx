import { View } from '@/components/Shared/styled';
import { dummyAccountData } from '../constants';
import AccountCard from './AccountCard';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';
import { useCallback } from 'react';
import { keyExtractor } from '@/lib/utils/number';
import { useAccountStore } from '../hooks';
import { groupBy } from '@/lib/utils/helpers';
import { Account } from '../schema';

export default function AccountsAccordion() {
    const { accounts } = useAccountStore();
    const renderItem: ListRenderItem<{ groupName: string; accounts: Account[] }> = useCallback(
        ({ item }) => <AccountCard groupName={item.groupName} accounts={item.accounts} />,
        [],
    );

    return (
        <FlatList
            data={Object.entries(groupBy(accounts, 'category')).map(([key, value]) => {
                return {
                    groupName: key,
                    accounts: value,
                };
            })}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.container}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        // marginVertical: 20,
    },
});
