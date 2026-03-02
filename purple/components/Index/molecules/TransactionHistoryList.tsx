import { ChevronRightIcon } from '@/components/SVG/icons/16x16';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { useTransactions, useTransactionStore } from '@/components/Transactions/hooks';
import TransactionCard from '@/components/Transactions/molecules/TransactionCard';
import { Transaction } from '@/components/Transactions/schema';
import { satoshiFont } from '@/lib/constants/fonts';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import { keyExtractor } from '@/lib/utils/number';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React, { useCallback, memo } from 'react';
import { Platform, StyleSheet } from 'react-native';

// Memoize the component to prevent unnecessary re-renders
const TransactionHistoryList = memo(function TransactionHistoryList({ onLoaded }: { onLoaded: () => void }) {
    const { setShowBottomSheetModal } = useBottomSheetModalStore();
    const { setCurrentTransaction } = useTransactionStore();
    const { data: transactions, refetch } = useTransactions({
        requestQuery: {
            page_size: 5,
        },
        options: {
            onSettled: () => {
                onLoaded();
            },
        },
    });

    const renderItem = useCallback(
        ({ item }: { item: Transaction }) => (
            <TransactionCard
                data={item}
                onPress={() => {
                    setCurrentTransaction(item);
                    setShowBottomSheetModal('transactionReceipt', true);
                }}
            />
        ),
        [setCurrentTransaction, setShowBottomSheetModal],
    );
    const renderItemSeparator = useCallback(
        () => <View className='border-b border-purple-100' />,
        [],
    );
    const renderEmptylist = useCallback(
        () => (
            <View className='my-5'>
                <EmptyList message='Start by creating transactions' />
            </View>
        ),
        [],
    );

    useRefreshOnFocus(refetch);

    return (
        <View className='flex flex-col mt-5 bg-purple-50 px-5 pt-5 pb-2.5 rounded-3xl border border-purple-100'>
            <View className='flex flex-row w-full justify-between items-center'>
                <Text style={satoshiFont.satoshiBlack} className='text-base text-black'>
                    Recent Transactions
                </Text>

                <TouchableOpacity
                    onPress={() => router.push('/transactions')}
                    className='flex flex-row items-center space-x-1'
                >
                    <Text style={satoshiFont.satoshiBold} className='text-sm text-purple-700'>
                        View All
                    </Text>
                    <ChevronRightIcon stroke='#9333ea' />
                </TouchableOpacity>
            </View>

            <FlashList
                estimatedItemSize={50}
                data={transactions?.data ?? []}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.flatlistContainerStyle}
                showsVerticalScrollIndicator={true}
                renderItem={renderItem}
                ItemSeparatorComponent={renderItemSeparator}
                scrollEnabled={false}
                ListEmptyComponent={renderEmptylist}
            />
        </View>
    );
});

export default TransactionHistoryList;

const styles = StyleSheet.create({
    zigZag: {
        transform: [{ rotate: '180deg' }],
    },
    customBottomSheetModal: {
        backgroundColor: 'white',
        borderRadius: 24,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 48,
        elevation: 10,
    },
    handleIndicator: {
        backgroundColor: '#D4D4D4',
    },
    receiptView: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.125,
        shadowRadius: 20,
        elevation: 5,
    },
    flatlistContainerStyle: {
        // paddingHorizontal: 20,
    },
    bottomDrawer: {
        backgroundColor: Platform.OS === 'android' ? '#F3F4F6' : 'white',
    },
    arrowRight: {
        position: 'absolute',
    },
    shadow: {
        shadowColor: '#A855F7',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
