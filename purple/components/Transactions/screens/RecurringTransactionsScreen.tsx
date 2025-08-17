import { ArrowLeftIcon, PlusIcon } from '@/components/SVG/icons/24x24';
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
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { memo, useEffect } from 'react';
import { StatusBar as RNStatusBar, RefreshControl, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useInfiniteTransactions, useTransactionStore } from '../hooks';
import { DotsHorizontalIcon, WalletIcon } from '@/components/SVG/icons/noscale';
import AnimatedFAB from '@/components/Shared/molecules/AnimatedFAB';
import { DotsVerticalIcon } from '@/components/SVG/icons/16x16';
import DropdownMenu from '@/components/Shared/molecules/DropdownMenu';

function RecurringTransactionsScreen() {
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
    ];

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
            <View className='w-full flex flex-row py-2.5 justify-between items-center relative px-5'>
                <TouchableOpacity
                    onPress={router.back}
                    className='bg-purple-50 px-4 py-2 flex items-center justify-center rounded-full'
                >
                    <ArrowLeftIcon stroke='#9333EA' strokeWidth={2.5} />
                </TouchableOpacity>

                <View className='absolute left-0 right-0 items-center'>
                    <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                        Recurring Transactions
                    </Text>
                </View>
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
            <AnimatedFAB
                renderMainContent={() => (
                    <LinearGradient
                        className='rounded-full  justify-center items-center space-y-4'
                        colors={['#c084fc', '#9333ea']}
                    >
                        <View
                            className='items-center w-[55px] h-[55px] justify-center rounded-full p-3 '
                            // onPress={() => {
                            //     router.push('/transactions/new-transaction');
                            // }}
                        >
                            <PlusIcon stroke={'#fff'} />
                        </View>
                    </LinearGradient>
                )}
                // mainButtonColor='red' // purple-700
                options={fabOptions}
                style={{ right: 20, bottom: 20 }}
                spacing={10} // Space between action buttons
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

export default memo(RecurringTransactionsScreen);
