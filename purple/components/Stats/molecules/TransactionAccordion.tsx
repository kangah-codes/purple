import { Transaction } from '@/components/Transactions/schema';
import { groupBy } from '@/lib/utils/helpers';
import { keyExtractor } from '@/lib/utils/number';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback } from 'react';
import TransactionCard from './TransactionCard';
import { FlatList } from 'react-native';
import { useTransactionStore } from '@/components/Transactions/hooks';
import { formatDate } from 'date-fns';

export default function TransactionsAccordion({ transactions }: { transactions: Transaction[] }) {
    // const { transactions } = useTransactionStore();
    const renderItem = useCallback(
        ({
            item,
        }: {
            item: { groupName: string; currency?: string; transactions: Transaction[] };
        }) => <TransactionCard groupName={item.groupName} transactions={item.transactions} />,
        [],
    );
    const transactionsByDate = useCallback(
        () =>
            transactions.map((transaction) => ({
                ...transaction,
                created_at_formatted: formatDate(transaction.created_at, 'dd/MM/yy'),
            })),
        [transactions],
    );

    const data = Object.entries(groupBy(transactionsByDate(), 'created_at_formatted'))
        .map(([key, value]) => {
            const [category, currency] = key.split('_');
            return {
                groupName: category,
                currency: currency,
                transactions: value,
            };
        })
        .filter((item) => item.transactions && item.transactions.length > 0);

    const renderTransactionAccordion = useCallback(
        () => (
            <FlashList
                estimatedItemSize={50}
                data={data}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
            />
        ),
        [],
    );

    return (
        <FlatList
            data={[{ key: 'accordion' }]} // Single item to render AccountsAccordion
            renderItem={renderTransactionAccordion}
            // ListHeaderComponent={renderHeader}
            contentContainerStyle={{ paddingBottom: 300 }}
            showsVerticalScrollIndicator={false}
            // refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        />
    );
}
