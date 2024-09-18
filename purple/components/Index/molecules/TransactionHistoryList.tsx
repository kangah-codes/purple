import { ChevronRightIcon } from '@/components/SVG/16x16';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { useTransactionStore } from '@/components/Transactions/hooks';
import CurrentTransactionModal from '@/components/Transactions/molecules/CurrentTransactionModal';
import TransactionHistoryCard from '@/components/Transactions/molecules/TransactionHistoryCard';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { keyExtractor } from '@/lib/utils/number';
import { router } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { FlatList, Platform, StyleSheet } from 'react-native';

export default function TransactionHistoryList() {
    const { setShowBottomSheetModal } = useBottomSheetModalStore();
    const { transactions, currentTransaction, setCurrentTransaction, setTransactions } =
        useTransactionStore();
    const getTopFiveTransactions = useCallback(() => {
        return transactions.slice(0, 5);
    }, [transactions]);

    const renderItem = useCallback(
        ({ item }: any) => (
            <TransactionHistoryCard
                data={item}
                onPress={() => {
                    setCurrentTransaction(item);
                    setShowBottomSheetModal('transactionReceiptIndexScreen', true);
                }}
            />
        ),
        [],
    );
    const renderItemSeparator = useCallback(
        () => <View className='border-b border-gray-100' />,
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
        <>
            <CurrentTransactionModal modalKey='transactionReceiptIndexScreen' />
            <View className='flex flex-col mt-5'>
                <View className='flex flex-row w-full justify-between items-center'>
                    <Text style={GLOBAL_STYLESHEET.suprapower} className='text-base text-black'>
                        Transaction History
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.push('/transactions')}
                        className='flex flex-row items-center space-x-1'
                    >
                        <Text
                            style={GLOBAL_STYLESHEET.interSemiBold}
                            className='text-sm tracking-tighter text-purple-700'
                        >
                            View All
                        </Text>
                        <ChevronRightIcon stroke='#9333ea' />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={getTopFiveTransactions()}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={styles.flatlistContainerStyle}
                    showsVerticalScrollIndicator={true}
                    renderItem={renderItem}
                    ItemSeparatorComponent={renderItemSeparator}
                    scrollEnabled={false}
                    ListEmptyComponent={renderEmptylist}
                />
            </View>
        </>
    );
}

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
        paddingBottom: 200,
    },
    bottomDrawer: {
        backgroundColor: Platform.OS === 'android' ? '#F3F4F6' : 'white',
    },
    arrowRight: {
        position: 'absolute',
    },
});
