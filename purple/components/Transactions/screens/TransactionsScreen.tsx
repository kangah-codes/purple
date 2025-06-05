import { PlusIcon } from '@/components/SVG/icons/24x24';
import {
    LinearGradient,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import TransactionsAccordion from '@/components/Stats/molecules/TransactionAccordion';
import { satoshiFont } from '@/lib/constants/fonts';
import { useRefreshOnFocus } from '@/lib/hooks/refetchOnFocus';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { memo, useEffect } from 'react';
import { StatusBar as RNStatusBar, RefreshControl, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useInfiniteTransactions, useTransactionStore } from '../hooks';

function TransactionsScreen() {
    const { transactions, setTransactions } = useTransactionStore();
    const { data, fetchNextPage, hasNextPage, refetch, isRefetching } = useInfiniteTransactions({
        requestQuery: {
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

    // reresh page on focus
    useRefreshOnFocus(refetch);

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

    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <ExpoStatusBar style='dark' />
            <View className='w-full flex flex-row py-2.5 justify-between items-center px-5'>
                <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                    My Transactions
                </Text>
            </View>
            <ScrollView
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            >
                <TransactionsAccordion
                    showTitle={false}
                    transactions={transactions}
                    onEndReached={handleLoadMore}
                />
            </ScrollView>
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
