import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import { Text, View } from '@/components/Shared/styled';
import { useTransactionStore } from '@/components/Transactions/hooks';
import TransactionHistoryCard from '@/components/Transactions/molecules/TransactionHistoryCard';
import { Transaction } from '@/components/Transactions/schema';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { formatDateTime } from '@/lib/utils/date';
import { formatCurrencyAccurate, keyExtractor } from '@/lib/utils/number';
import { FlashList } from '@shopify/flash-list';
import React, { useMemo } from 'react';

const ItemSeparator = () => <View className='h-1 border-b border-purple-100' />;
export default function TransactionCard({
    groupName,
    transactions,
}: {
    groupName: string;
    transactions: Transaction[];
}) {
    const { setCurrentTransaction } = useTransactionStore();
    const { setShowBottomSheetModal } = useBottomSheetModalStore();

    const calculateTotalBalance = useMemo(() => {
        return transactions.reduce((acc, curr) => acc + curr.amount, 0);
    }, [transactions]);
    const formattedDate = useMemo(() => {
        return transactions.length > 0 ? formatDateTime(transactions[0].created_at).date : '';
    }, [transactions]);
    const formattedTotal = useMemo(() => {
        if (transactions.length === 0) return '';
        return formatCurrencyAccurate(transactions[0].currency, calculateTotalBalance);
    }, [transactions, calculateTotalBalance]);
    const renderItem = React.useCallback(
        ({ item }: { item: Transaction }) => (
            <TransactionHistoryCard
                data={item}
                onPress={() => {
                    setCurrentTransaction(item);
                    setShowBottomSheetModal('transactionReceipt', true);
                }}
            />
        ),
        [],
    );

    if (!transactions || transactions.length === 0) {
        return null;
    }

    return (
        <>
            <View className='flex flex-row items-center justify-between py-2.5'>
                <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-xs text-purple-500'>
                    {formattedDate}
                </Text>
                <Text style={[GLOBAL_STYLESHEET.satoshiBlack]} className='text-xs text-purple-500'>
                    {formattedTotal}
                </Text>
            </View>
            <View className='flex flex-col'>
                <FlashList
                    estimatedItemSize={300}
                    data={transactions}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    ItemSeparatorComponent={ItemSeparator}
                    scrollEnabled={false}
                />
            </View>
        </>
    );
}
