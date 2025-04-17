import { Transaction } from '@/components/Transactions/schema';
import { groupBy } from '@/lib/utils/helpers';
import { FlashList } from '@shopify/flash-list';
import { formatDate } from 'date-fns';
import React, { useMemo } from 'react';
import {} from 'react-native';
import TransactionCard from './TransactionCard';
import { Text, View } from '@/components/Shared/styled';

export default function TransactionsAccordion({ transactions }: { transactions: Transaction[] }) {
    const groupedTransactionData = useMemo(() => {
        const transactionsWithFormattedDate = transactions.map((transaction) => ({
            ...transaction,
            created_at_formatted: formatDate(transaction.created_at, 'dd/MM/yy'),
        }));

        return Object.entries(groupBy(transactionsWithFormattedDate, 'created_at_formatted'))
            .map(([key, value]) => {
                const [category, currency] = key.split('_');
                return {
                    groupName: category,
                    currency: currency,
                    transactions: value,
                    id: key,
                };
            })
            .filter((item) => item.transactions && item.transactions.length > 0);
    }, [transactions]);

    const renderItem = React.useCallback(
        ({
            item,
        }: {
            item: { groupName: string; currency?: string; transactions: Transaction[]; id: string };
        }) => <TransactionCard groupName={item.groupName} transactions={item.transactions} />,
        [],
    );

    return (
        <View style={{ flex: 1 }} className='px-5'>
            <FlashList
                estimatedItemSize={300}
                data={groupedTransactionData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 300 }}
                showsVerticalScrollIndicator={false}
                // refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
            />
        </View>
    );
}
