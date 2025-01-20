import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import { View, Text } from '@/components/Shared/styled';
import { keyExtractor } from '@/lib/utils/number';
import React, { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { Transaction } from '@/components/Transactions/schema';
import TransactionHistoryCard from '@/components/Transactions/molecules/TransactionHistoryCard';
import { useTransactionStore } from '@/components/Transactions/hooks';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';

export default function AccountTransactionsList({
    transactions,
    queryData: { refetch, refreshing, handleLoadMore },
}: {
    transactions: Transaction[];
    queryData: {
        refetch: () => void;
        refreshing: boolean;
        handleLoadMore: () => void;
    };
}) {
    const { setCurrentTransaction } = useTransactionStore();
    const { setShowBottomSheetModal } = useBottomSheetModalStore();

    const renderItem = useCallback(
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
    const renderEmptylist = useCallback(
        () => (
            <View className='my-20'>
                <EmptyList message="Looks like you haven't created any transactions for this plan yet." />
            </View>
        ),
        [],
    );
    const renderItemSeparator = useCallback(
        () => <View className='border-b border-purple-100' />,
        [],
    );

    return (
        <View className='flex flex-col mt-5'>
            <View className='flex flex-row w-full justify-between items-center px-5'>
                <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-lg text-black'>
                    Transactions
                </Text>
            </View>

            <FlashList
                estimatedItemSize={40}
                data={transactions}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={true}
                renderItem={renderItem}
                ItemSeparatorComponent={renderItemSeparator}
                ListEmptyComponent={renderEmptylist}
                onEndReachedThreshold={0.5}
                scrollEnabled={false}
                onRefresh={refetch}
                refreshing={refreshing}
                onEndReached={handleLoadMore}
            />
        </View>
    );
}
const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 100,
        paddingHorizontal: 20,
    },
});
