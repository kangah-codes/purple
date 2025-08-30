import { CalendarIcon } from '@/components/SVG/icons/16x16';
import { PlusIcon, TrashIcon } from '@/components/SVG/icons/24x24';
import { DotsHorizontalIcon } from '@/components/SVG/icons/noscale';
import DropdownMenu from '@/components/Shared/molecules/DropdownMenu';
import { MenuOption } from '@/components/Shared/molecules/DropdownMenu/MenuOption';
import {
    LinearGradient,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import TransactionsAccordion from '@/components/Transactions/molecules/TransactionAccordion';
import { satoshiFont } from '@/lib/constants/fonts';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useEffect, useState } from 'react';
import { StatusBar as RNStatusBar, RefreshControl, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';
import { useInfiniteTransactions, useTransactionStore } from '../hooks';
import RecurringTransactionsWidget from '../molecules/RecurringTransactionsWidget';

export default function IndexScreen() {
    const { transactions: tx } = useTransactionStore();
    const [visible, setVisible] = useState(false);
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

    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <ExpoStatusBar style='dark' />
            <View className='w-full flex flex-row py-2.5 justify-between items-center relative px-5'>
                <DropdownMenu
                    visible={visible}
                    handleOpen={() => setVisible(true)}
                    handleClose={() => setVisible(false)}
                    trigger={
                        <View className='bg-purple-50 px-4 py-2 flex items-center justify-center rounded-full'>
                            <DotsHorizontalIcon
                                stroke='#9333EA'
                                strokeWidth={2.5}
                                width={24}
                                height={24}
                            />
                        </View>
                    }
                    padX={20}
                    dropdownWidth={210}
                    offsetY={10}
                    style={[tw`rounded-3xl bg-white p-2 px-4`, styles.shadow]}
                >
                    <MenuOption
                        onSelect={() => {
                            setVisible(false);
                            router.push('/settings/transactions/recurring-transactions');
                        }}
                    >
                        <View className='flex flex-row items-center space-x-2 py-1.5'>
                            <CalendarIcon
                                stroke='#9333EA'
                                width={18}
                                height={18}
                                strokeWidth={1.5}
                            />
                            <Text style={satoshiFont.satoshiMedium} className='text-sm'>
                                Recurring transactions
                            </Text>
                        </View>
                    </MenuOption>
                    <View className='h-[1px] border-b border-purple-200 my-0.5' />
                    <MenuOption onSelect={alert}>
                        <View className='flex flex-row items-center space-x-1 py-1.5'>
                            <TrashIcon stroke='#EF4444' width={18} />
                            <Text style={satoshiFont.satoshiMedium} className='text-sm'>
                                Delete
                            </Text>
                        </View>
                    </MenuOption>
                </DropdownMenu>

                <View className='absolute left-0 right-0 items-center'>
                    <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                        Transactions
                    </Text>
                </View>

                <LinearGradient
                    className='rounded-full justify-center items-center'
                    colors={['#c084fc', '#9333ea']}
                >
                    <TouchableOpacity
                        className='px-4 py-2 flex items-center justify-center rounded-full'
                        onPress={() => router.push('/transactions/new-transaction')}
                    >
                        <PlusIcon stroke={'#fff'} width={24} height={24} />
                    </TouchableOpacity>
                </LinearGradient>
            </View>
            <ScrollView
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            >
                <View className='px-5 my-5'>
                    <RecurringTransactionsWidget />
                </View>
                <TransactionsAccordion
                    showTitle={false}
                    transactions={transactions}
                    onEndReached={handleLoadMore}
                />
            </ScrollView>
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
    shadow: {
        shadowColor: '#3c0366',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
});
