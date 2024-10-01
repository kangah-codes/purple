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
    console.log(groupBy(accounts, 'category'));
    /**
     * {"Bank": [{"ID": "7039399f-f4a0-478c-9795-fd62cc1282c8", "balance": 1000, "category": "Bank", "created_at": "2024-09-15T14:31:59.864623Z", "deleted_at": null, "is_default_account": false, "name": "EcoBank Account", "updated_at": "2024-09-15T14:31:59.864623Z", "user_id": "e25180d2-5153-4411-a637-0d57d9047e47"}, {"ID": "e9b06872-a1af-4991-beaa-b8acc732b159", "balance": 100, "category": "Bank", "created_at": "2024-09-15T14:31:37.52058Z", "deleted_at": null, "is_default_account": false, "name": "Fidelity Bank Account", "updated_at": "2024-09-15T14:31:37.52058Z", "user_id": "e25180d2-5153-4411-a637-0d57d9047e47"}], "💵 Cash": [{"ID": "38a05679-0c4a-4365-bf5f-eadcd7e17c23", "balance": 0, "category": "💵 Cash", "created_at": "2024-09-15T12:37:53.77406Z", "deleted_at": null, "is_default_account": true, "name": "Cash", "updated_at": "2024-09-15T12:37:53.77406Z", "user_id": "e25180d2-5153-4411-a637-0d57d9047e47"}]}
     */
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
