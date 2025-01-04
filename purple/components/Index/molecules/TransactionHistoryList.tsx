import { ChevronRightIcon } from '@/components/SVG/16x16';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { useTransactionStore } from '@/components/Transactions/hooks';
import TransactionHistoryCard from '@/components/Transactions/molecules/TransactionHistoryCard';
import { Transaction } from '@/components/Transactions/schema';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { dedupeByKey } from '@/lib/utils/array';
import { keyExtractor } from '@/lib/utils/number';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Platform, StyleSheet } from 'react-native';

export default function TransactionHistoryList() {
    const { setShowBottomSheetModal } = useBottomSheetModalStore();
    const { transactions, setCurrentTransaction } = useTransactionStore();
    const getTopFiveTransactions = useCallback(() => {
        // TODO: research why duplicate transactions were being sent in the first place instead of this shit
        return dedupeByKey(transactions.slice(0, 5), 'ID');
    }, [transactions]);

    console.log('TRAN', transactions);

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
            {/* <Portal hostName='transactionReceipt'>
                <CurrentTransactionModal modalKey='transactionReceipt' />
            </Portal> */}
            <View className='flex flex-col mt-2.5'>
                <View className='flex flex-row w-full justify-between items-center px-5'>
                    <Text style={GLOBAL_STYLESHEET.gramatikaBlack} className='text-base text-black'>
                        Recent Transactions
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.push('/transactions')}
                        className='flex flex-row items-center space-x-1'
                    >
                        <Text
                            style={GLOBAL_STYLESHEET.gramatikaBold}
                            className='text-sm text-purple-700'
                        >
                            View All
                        </Text>
                        <ChevronRightIcon stroke='#9333ea' />
                    </TouchableOpacity>
                </View>

                <FlashList
                    estimatedItemSize={50}
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
        paddingHorizontal: 20,
    },
    bottomDrawer: {
        backgroundColor: Platform.OS === 'android' ? '#F3F4F6' : 'white',
    },
    arrowRight: {
        position: 'absolute',
    },
});
