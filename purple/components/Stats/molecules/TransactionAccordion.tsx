import { Transaction } from '@/components/Transactions/schema';
import { groupBy } from '@/lib/utils/helpers';
import { FlashList } from '@shopify/flash-list';
import { formatDate } from 'date-fns';
import React, { useCallback, useMemo } from 'react';
import TransactionCard from './TransactionCard';
import { Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import EmptyList from '@/components/Shared/molecules/ListStates/Empty';

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
    const renderEmptylist = useCallback(
        () => (
            <View className='my-20'>
                <EmptyList message="Looks like you haven't created any transactions yet." />
            </View>
        ),
        [],
    );

    return (
        <View style={{ flex: 1 }} className='px-5 flex flex-col space-y-2.5 mt-5'>
            <Text className='text-base text-black' style={GLOBAL_STYLESHEET.satoshiBlack}>
                My transactions
            </Text>
            <FlashList
                estimatedItemSize={300}
                data={groupedTransactionData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 300 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptylist}
            />
        </View>
    );
}
