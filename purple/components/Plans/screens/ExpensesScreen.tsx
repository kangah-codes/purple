import { useAuth } from '@/components/Auth/hooks';
import { SessionData } from '@/components/Auth/schema';
import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import { View } from '@/components/Shared/styled';
import { keyExtractor } from '@/lib/utils/number';
import React, { memo, useCallback, useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useInfinitePlans, usePlanStore } from '../hooks';
import BudgetPlanCard from '../molecules/BudgetCard';
import { Plan } from '../schema';
import { useRefreshOnFocus } from '@/lib/hooks/refetchOnFocus';

function ExpensesScreen() {
    const { sessionData } = useAuth();
    const { setExpensePlans, expensePlans } = usePlanStore();
    const { data, fetchNextPage, hasNextPage, isLoading, isError, refetch, isFetching } =
        useInfinitePlans({
            requestQuery: {
                type: 'expense',
                page_size: 10,
            },
            options: {
                onError: () => {
                    Toast.show({
                        type: 'error',
                        props: {
                            text1: 'Error!',
                            text2: "We couldn't fetch your plans",
                        },
                    });
                },
            },
        });

    useRefreshOnFocus(refetch);
    const itemSeparator = useCallback(() => <View style={styles.itemSeparator} />, []);
    const renderItem = useCallback(
        ({ item }: { item: Plan }) => <BudgetPlanCard data={item} />,
        [],
    );
    const renderEmptylist = useCallback(
        () => (
            <View className='my-20'>
                <EmptyList message="Looks like you haven't created any expense plans yet." />
            </View>
        ),
        [],
    );
    const listHeader = useCallback(() => {
        if (expensePlans.length === 0) return null;
        return (
            <View className='flex flex-col space-y-5 -px-5'>
                {/* <PlanInfoCard type='expense' /> */}
                <View style={styles.listHeaderView} />
            </View>
        );
    }, []);

    useEffect(() => {
        if (data) {
            const tx = data.pages.flatMap((page) => page.data);
            setExpensePlans(tx);
        }
    }, [data]);

    const handleLoadMore = () => {
        if (hasNextPage) {
            fetchNextPage();
        }
    };

    return (
        <FlatList
            contentContainerStyle={styles.contentContainer}
            style={styles.container}
            numColumns={2}
            columnWrapperStyle={{ gap: 10 }}
            showsHorizontalScrollIndicator={false}
            data={expensePlans}
            renderItem={({ item }) => (
                <View style={{ flex: 0.5 }}>
                    <BudgetPlanCard data={item} />
                </View>
            )}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={itemSeparator}
            initialNumToRender={5}
            ListHeaderComponent={listHeader}
            refreshing={isLoading}
            onRefresh={refetch}
            ListEmptyComponent={renderEmptylist}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
    },
    contentContainer: {
        paddingBottom: 100,
        // paddingHorizontal: 20,
    },
    listHeaderView: {
        // marginTop: 20,
    },
    itemSeparator: {
        height: 10,
    },
});
export default memo(ExpensesScreen);
