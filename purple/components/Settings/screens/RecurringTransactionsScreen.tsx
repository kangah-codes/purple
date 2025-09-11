import { ArrowLeftIcon, PlusIcon } from '@/components/SVG/icons/24x24';
import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import {
    LinearGradient,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import UpcomingTransactionCard from '@/components/Transactions/molecules/UpcomingTransactionCard';
import { RecurringTransaction } from '@/components/Transactions/schema';
import { satoshiFont } from '@/lib/constants/fonts';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { memo, useCallback, useEffect } from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useInfiniteRecurringTransactions, useTransactionStore } from '../../Transactions/hooks';
import RecurringTransactionCard from '@/components/Transactions/molecules/RecurringTransactionCard';

function RecurringTransactionsScreen() {
    const { recurringTransactions, setRecurringTransactions } = useTransactionStore();
    const { data, fetchNextPage, hasNextPage, refetch, isRefetching } =
        useInfiniteRecurringTransactions({
            requestQuery: {
                page_size: 10,
                status: 'active',
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

    const renderItem = useCallback(
        ({ item }: { item: RecurringTransaction }) => (
            <RecurringTransactionCard transaction={item} />
        ),
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

    // reresh page on focus
    useRefreshOnFocus(refetch);

    // flatten the data
    useEffect(() => {
        if (data) {
            const tx = data.pages.flatMap((page) => page.data);
            setRecurringTransactions(tx);
        }
    }, [data]);

    const handleLoadMore = () => {
        if (hasNextPage) {
            fetchNextPage();
        }
    };

    return (
        <SafeAreaView className='bg-white relative h-full px-5' style={styles.parentView}>
            <ExpoStatusBar style='dark' />
            <View className='w-full flex flex-row py-2.5 justify-between items-center relative'>
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

                <LinearGradient
                    className='rounded-full justify-center items-center'
                    colors={['#c084fc', '#9333ea']}
                >
                    <TouchableOpacity
                        className='px-4 py-2 flex items-center justify-center rounded-full'
                        onPress={() => router.push('/transactions/new-recurring-transaction')}
                    >
                        <PlusIcon stroke={'#fff'} width={24} height={24} />
                    </TouchableOpacity>
                </LinearGradient>
            </View>
            <FlashList
                estimatedItemSize={300}
                data={recurringTransactions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 300 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptylist}
                onEndReachedThreshold={0.5}
                onEndReached={handleLoadMore}
                ItemSeparatorComponent={() => (
                    <View className='h-[1px] border-b border-purple-100' />
                )}
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
