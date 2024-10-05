import { GenericAPIResponse } from '@/@types/request';
import { useAuth } from '@/components/Auth/hooks';
import { SessionData } from '@/components/Auth/schema';
import { PlusIcon } from '@/components/SVG/24x24';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import {
    LinearGradient,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { keyExtractor } from '@/lib/utils/number';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, Platform, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useInfiniteTransactions, useTransactions, useTransactionStore } from '../hooks';
import CurrentTransactionModal from '../molecules/CurrentTransactionModal';
import TransactionHistoryCard from '../molecules/TransactionHistoryCard';
import { Transaction } from '../schema';
import { stringify, truncateStringIfLongerThan } from '@/lib/utils/string';
import { useInfiniteQuery } from 'react-query';

type TransactionsScreenProps = {
    showBackButton?: boolean;
};

function TransactionsScreen(props: TransactionsScreenProps) {
    const local = useLocalSearchParams();
    const { sessionData } = useAuth();
    const { accountID, accountName } = local;
    const { setTransactions, setCurrentTransaction } = useTransactionStore();
    const { showBackButton } = props;
    const { setShowBottomSheetModal } = useBottomSheetModalStore();
    // const { isLoading, refetch } = useTransactions({
    //     sessionData: sessionData as SessionData,
    //     options: {
    //         onSuccess: (data) => {
    //             // we're doing this so that the transaction store
    //             // isn't overwritten when we're viewing a specific account
    //             if (!showBackButton) {
    //                 const res = data as GenericAPIResponse<Transaction[]>;
    //                 setTransactions(res.data);
    //             }
    //         },
    //         onError: () => {
    //             Toast.show({
    //                 type: 'error',
    //                 props: {
    //                     text1: 'Error!',
    //                     text2: "We couldn't fetch your transactions",
    //                 },
    //             });
    //         },
    //     },
    //     requestQuery: {
    //         accountID,
    //     },
    // });

    const { data, fetchNextPage, hasNextPage, isLoading, isError, refetch, isFetching } =
        useInfiniteTransactions({
            sessionData: sessionData as SessionData,
            requestQuery: {
                accountID,
                page_size: 10,
            },
            options: {
                onError: () => {
                    Toast.show({
                        type: 'error',
                        props: {
                            text1: 'Error!',
                            text2: "We couldn't fetch your transactions",
                        },
                    });
                },
            },
        });

    // flatten the data
    const transactions = useMemo(
        () => (data ? data.pages.flatMap((page) => page.data) : []),
        [data],
    );

    const handleLoadMore = () => {
        if (hasNextPage) {
            fetchNextPage();
        }
    };

    if (isError) {
        Toast.show({
            type: 'error',
            props: {
                text1: 'Error!',
                text2: "We couldn't fetch your transactions",
            },
        });
    }

    const renderItem = useCallback(
        ({ item }: { item: Transaction }) => (
            <TransactionHistoryCard
                data={item}
                onPress={() => {
                    setCurrentTransaction(item);
                    setShowBottomSheetModal('transactionReceiptTransactionsScreen', true);
                }}
            />
        ),
        [],
    );
    const renderEmptylist = useCallback(
        () => (
            <View className='my-20'>
                <EmptyList message="Looks like you haven't created any transactions plans yet." />
            </View>
        ),
        [],
    );
    const renderItemSeparator = useCallback(
        () => <View className='border-b border-gray-100' />,
        [],
    );
    const filteredTransactions = useMemo(() => {
        if (accountID) {
            return transactions.filter((transaction) => transaction.account_id === accountID);
        }
        return transactions;
    }, [accountID, transactions]);

    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <ExpoStatusBar style='dark' />
            <CurrentTransactionModal modalKey='transactionReceiptTransactionsScreen' />
            <View className='w-full flex flex-row py-2.5 justify-between items-center px-5'>
                {showBackButton && accountName ? (
                    <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg'>
                        {truncateStringIfLongerThan(accountName as string, 20)}
                    </Text>
                ) : (
                    <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg'>
                        My Transactions
                    </Text>
                )}

                {showBackButton && (
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={GLOBAL_STYLESHEET.interSemiBold} className='text-purple-600'>
                            Back
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            <FlatList
                data={showBackButton ? filteredTransactions : transactions}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={true}
                renderItem={renderItem}
                ItemSeparatorComponent={renderItemSeparator}
                onRefresh={refetch}
                refreshing={isFetching}
                ListEmptyComponent={renderEmptylist}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
            />
            {!showBackButton && (
                <LinearGradient
                    className='rounded-full  justify-center items-center space-y-4 absolute right-5 bottom-5'
                    colors={['#c084fc', '#9333ea']}
                >
                    <TouchableOpacity
                        className='items-center w-[55px] h-[55px] justify-center rounded-full p-3 '
                        onPress={() => {
                            router.push('/transactions/new-transaction');
                        }}
                    >
                        <PlusIcon stroke={'#fff'} />
                    </TouchableOpacity>
                </LinearGradient>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    bottomSheetModal: {
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
    receiptContainer: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.125,
        shadowRadius: 20,
        elevation: 5,
    },
    zigzag: {
        transform: [{ rotate: '180deg' }],
    },
    receipt: {
        backgroundColor: Platform.OS === 'android' ? '#F3F4F6' : 'white',
    },
    bottomDrawer: {
        backgroundColor: Platform.OS === 'android' ? '#F3F4F6' : 'white',
    },
    contentContainer: {
        paddingBottom: 100,
        paddingHorizontal: 20,
    },
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
export default memo(TransactionsScreen);
