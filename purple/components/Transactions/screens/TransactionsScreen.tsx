import { PlusIcon } from '@/components/SVG/icons/24x24';
import AnimatedFAB from '@/components/Shared/molecules/AnimatedFAB';
import { LinearGradient, SafeAreaView, ScrollView, Text, View } from '@/components/Shared/styled';
import TransactionsAccordion from '@/components/Stats/molecules/TransactionAccordion';
import { satoshiFont } from '@/lib/constants/fonts';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { memo, useEffect } from 'react';
import { StatusBar as RNStatusBar, RefreshControl, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useInfiniteTransactions, useTransactionStore } from '../hooks';
import RecurringTransactionsWidget from '../molecules/RecurringTransactionsWidget';

function TransactionsScreen() {
    const { transactions: tx } = useTransactionStore();
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

    // Refresh page on focus
    useRefreshOnFocus(refetch);

    // TODO: refactor this to use store hook with built-in sync, or probably some event driven shit
    // works for now so im leaving to future Joshua to figure out
    useEffect(() => {
        refetch();
    }, [tx]);

    const transactions = data ? data.pages.flatMap((page) => page.data) : [];
    const handleLoadMore = () => {
        if (hasNextPage) {
            fetchNextPage();
        }
    };

    const fabOptions = [
        {
            renderContent: () => (
                <View className='bg-purple-100 px-2.5 py-1 rounded-full border border-purple-200'>
                    <Text style={satoshiFont.satoshiBold} className='text-sm text-purple-600'>
                        Recurring Transaction
                    </Text>
                </View>
            ),
            onPress: () => router.push('/transactions/new-recurring-transaction'),
        },
        {
            renderContent: () => (
                <View className='bg-purple-100 px-2.5 py-1 rounded-full border border-purple-200'>
                    <Text style={satoshiFont.satoshiBold} className='text-sm text-purple-600'>
                        Regular Transaction
                    </Text>
                </View>
            ),
            onPress: () => router.push('/transactions/new-transaction'),
        },
    ];

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
                <View className='px-5 mb-5'>
                    <RecurringTransactionsWidget />
                </View>
                <TransactionsAccordion
                    showTitle={false}
                    transactions={transactions}
                    onEndReached={handleLoadMore}
                />
            </ScrollView>
            <AnimatedFAB
                renderMainContent={() => (
                    <LinearGradient
                        className='rounded-full  justify-center items-center space-y-4'
                        colors={['#c084fc', '#9333ea']}
                    >
                        <View className='items-center w-[55px] h-[55px] justify-center rounded-full p-3'>
                            <PlusIcon stroke={'#fff'} />
                        </View>
                    </LinearGradient>
                )}
                options={fabOptions}
                style={{ right: 20, bottom: 20 }}
                spacing={10}
                animationDuration={100}
            />
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
