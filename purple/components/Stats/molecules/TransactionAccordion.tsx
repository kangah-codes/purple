import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import { Text, View } from '@/components/Shared/styled';
import { Transaction } from '@/components/Transactions/schema';
import { satoshiFont } from '@/lib/constants/fonts';
import { groupBy } from '@/lib/utils/helpers';
import { FlashList } from '@shopify/flash-list';
import { formatDate } from 'date-fns';
import React, { useCallback, useMemo } from 'react';
import TransactionCard from './TransactionCard';

type TransactionsAccordionProps = {
    transactions: Transaction[];
    title?: string;
    onEndReached?: () => void;
    showTitle?: boolean;
};

export default function TransactionsAccordion({
    transactions,
    title,
    onEndReached,
    showTitle = true,
}: TransactionsAccordionProps) {
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

    const renderItem = useCallback(
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
        <View
            style={{ flex: 1, marginTop: showTitle ? 20 : 0 }}
            className='px-5 flex flex-col space-y-2.5'
        >
            {showTitle && (
                <Text className='text-base text-black' style={satoshiFont.satoshiBlack}>
                    {title ?? 'My transactions'}
                </Text>
            )}

            <FlashList
                estimatedItemSize={300}
                data={groupedTransactionData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 300 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptylist}
                onEndReachedThreshold={0.5}
                onEndReached={onEndReached}
                scrollEnabled={false}
            />
        </View>
    );
}
