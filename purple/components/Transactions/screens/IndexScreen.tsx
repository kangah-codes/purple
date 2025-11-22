import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, StatusBar as RNStatusBar, StyleSheet, FlatList } from 'react-native';
import { LinearGradient, SafeAreaView, View } from '@/components/Shared/styled';
import RecurringTransactionsWidget from '../molecules/RecurringTransactionsWidget';
import TransactionsNavigationArea from '../molecules/TransactionsNavigationArea';
import TransactionCard from '../../Stats/molecules/TransactionCard';
import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import Toast from 'react-native-toast-message';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { groupBy } from '@/lib/utils/helpers';
import { format } from 'date-fns';
import {
    hasActiveTransactionFilters,
    useInfiniteTransactions,
    useTransactionStore,
} from '../hooks';
import { Transaction } from '../schema';
import { useDebounce } from '@/lib/utils/debounce';
import TransactionsFilter from '../molecules/TransactionsFilter';

export default function IndexScreen() {
    const flatListRef = useRef<FlatList>(null);
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearchValue, setDebouncedSearchValue] = useState('');
    const debouncedSetSearch = useDebounce((value: string) => {
        setDebouncedSearchValue(value);
    }, 500);
    const { transactionsFilter } = useTransactionStore();
    const hasActiveFilters = hasActiveTransactionFilters(transactionsFilter);
    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchValue(value);
            debouncedSetSearch(value);
        },
        [debouncedSetSearch],
    );

    const { data, fetchNextPage, hasNextPage, refetch, isRefetching } = useInfiniteTransactions({
        requestQuery: {
            page_size: 10,
            ...(debouncedSearchValue !== '' && { search_value: debouncedSearchValue }),
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

    // flatten pages into plain transactions array
    const transactions = useMemo(() => (data ? data.pages.flatMap((p) => p.data) : []), [data]);
    const groupedTransactionData = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];
        const withDate = transactions.map((t) => ({
            ...t,
            created_at_formatted: format(new Date(t.created_at), 'dd/MM/yy'),
        }));

        return Object.entries(groupBy(withDate, 'created_at_formatted')).map(([key, value]) => ({
            id: key,
            groupName: key,
            transactions: value,
        }));
    }, [transactions]);

    const shadowOpacity = useSharedValue(0);
    const handleScroll = (event: { nativeEvent: { contentOffset: { y: number } } }) => {
        const scrollY = event.nativeEvent.contentOffset.y;
        const newOpacity = scrollY > 0 ? Math.min(scrollY / 20, 1) : 0;
        shadowOpacity.value = withSpring(newOpacity, { damping: 15, stiffness: 150 });
    };

    const shadowStyle = useAnimatedStyle(() => {
        return {
            opacity: shadowOpacity.value,
        };
    });

    useRefreshOnFocus(refetch);

    const scrollToTransactionsList = useCallback(() => {
        if (flatListRef.current) {
            if (groupedTransactionData.length > 0) {
                setTimeout(() => {
                    try {
                        flatListRef.current?.scrollToIndex({
                            index: 0,
                            animated: true,
                            viewPosition: 0,
                        });
                    } catch {
                        flatListRef.current?.scrollToOffset({
                            offset: 250, // est height of RecurringTransactionsWidget
                            animated: true,
                        });
                    }
                }, 100);
            } else {
                setTimeout(() => {
                    flatListRef.current?.scrollToOffset({
                        offset: 250, // est height of RecurringTransactionsWidget
                        animated: true,
                    });
                }, 100);
            }
        }
    }, [groupedTransactionData]);

    const fetchingNextRef = useRef(false);
    const initialMountRef = useRef(true);
    useEffect(() => {
        const id = setTimeout(() => {
            initialMountRef.current = false;
        }, 500);
        return () => clearTimeout(id);
    }, []);

    const handleLoadMore = useCallback(() => {
        if (initialMountRef.current) return;
        if (!hasNextPage) return;
        if (fetchingNextRef.current) return;

        fetchingNextRef.current = true;
        fetchNextPage?.().finally(() => {
            fetchingNextRef.current = false;
        });
    }, [fetchNextPage, hasNextPage]);
    const renderItem = ({ item }: { item: { groupName: string; transactions: Transaction[] } }) => (
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
            <TransactionCard groupName={item.groupName} transactions={item.transactions} />
        </View>
    );
    const ListHeaderComponent = useMemo(() => {
        if (debouncedSearchValue.length > 0 || hasActiveFilters) return null;
        return <RecurringTransactionsWidget />;
    }, [debouncedSearchValue, hasActiveFilters]);
    const ListEmptyComponent = useMemo(
        () => (
            <View style={{ marginTop: 40 }}>
                <EmptyList message="Looks like you haven't created any transactions yet." />
            </View>
        ),
        [],
    );

    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <TransactionsNavigationArea
                onSearchFocus={scrollToTransactionsList}
                onSearchChange={handleSearchChange}
                searchValue={searchValue}
            />
            <TransactionsFilter />

            {/* Shadow overlay */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: (RNStatusBar.currentHeight ?? 0) + 60 + 58,
                        height: 20,
                        zIndex: 999,
                    },
                    shadowStyle,
                ]}
                pointerEvents='none'
            >
                <LinearGradient
                    colors={['rgba(250, 245, 255, 0.95)', 'transparent']}
                    style={{ flex: 1 }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                />
            </Animated.View>

            <FlatList
                ref={flatListRef}
                data={groupedTransactionData}
                keyExtractor={(item) => item.groupName}
                renderItem={renderItem}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
                ListHeaderComponent={ListHeaderComponent}
                ListEmptyComponent={ListEmptyComponent}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
                removeClippedSubviews={false}
                maxToRenderPerBatch={10}
                windowSize={10}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    parentView: { paddingTop: RNStatusBar.currentHeight },
});
