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
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { keyExtractor } from '@/lib/utils/number';
import { router, useLocalSearchParams } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { memo, useCallback, useEffect } from 'react';
import { FlatList, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useInfiniteTransactions, useTransactionStore } from '../hooks';
import TransactionHistoryCard from '../molecules/TransactionHistoryCard';
import { Transaction } from '../schema';
import { FlashList } from '@shopify/flash-list';

type TransactionsScreenProps = {
    showBackButton?: boolean;
};

function TransactionsScreen(props: TransactionsScreenProps) {
    const { accountID } = useLocalSearchParams();
    const { sessionData } = useAuth();
    const { transactions, setCurrentTransaction, setTransactions } = useTransactionStore();
    const { setShowBottomSheetModal } = useBottomSheetModalStore();
    const { data, fetchNextPage, hasNextPage, isError, refetch, isFetching } =
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
    useEffect(() => {
        if (data) {
            const tx = data.pages.flatMap((page) => page.data);
            setTransactions(tx);
        }
    }, [data]);

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
                    setShowBottomSheetModal('transactionReceipt', true);
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

    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <ExpoStatusBar style='dark' />
            <View className='w-full flex flex-row py-2.5 justify-between items-center px-5'>
                <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-lg'>
                    My Transactions
                </Text>

                {accountID && (
                    // no idea why this is even here
                    <TouchableOpacity onPress={router.back}>
                        <Text style={GLOBAL_STYLESHEET.satoshiMedium} className='text-purple-600'>
                            Back
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            <FlashList
                estimatedItemSize={100}
                data={transactions}
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 100,
        paddingHorizontal: 20,
    },
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});

export default memo(TransactionsScreen);
