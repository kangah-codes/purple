import { LinearGradient, SafeAreaView, View } from '@/components/Shared/styled';
import TransactionsAccordion from '@/components/Transactions/molecules/TransactionAccordion';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useEffect } from 'react';
import { StatusBar as RNStatusBar, RefreshControl, StyleSheet } from 'react-native';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { useInfiniteTransactions, useTransactionStore } from '../hooks';
import RecurringTransactionsWidget from '../molecules/RecurringTransactionsWidget';
import TransactionsNavigationArea from '../molecules/TransactionsNavigationArea';

export default function IndexScreen() {
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

    const scrollY = useSharedValue(0);
    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const shadowStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(scrollY.value, [0, 20], [0, 1], Extrapolation.CLAMP),
        };
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
            <TransactionsNavigationArea />
            <View className='relative'>
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            height: 20,
                            zIndex: 999,
                        },
                        shadowStyle,
                    ]}
                    pointerEvents='none'
                >
                    <LinearGradient colors={['#faf5ff', 'transparent']} style={{ flex: 1 }} />
                </Animated.View>

                <Animated.ScrollView
                    showsVerticalScrollIndicator={false}
                    onScroll={onScroll}
                    // scrollEventThrottle={16}
                    // refreshControl={
                    //     <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                    // }
                >
                    <RecurringTransactionsWidget />
                    <TransactionsAccordion
                        showTitle={false}
                        transactions={transactions}
                        onEndReached={handleLoadMore}
                    />
                </Animated.ScrollView>
            </View>
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
