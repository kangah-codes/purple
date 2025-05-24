import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import { View } from '@/components/Shared/styled';
import { keyExtractor } from '@/lib/utils/number';
import { useFocusEffect } from '@react-navigation/native';
import React, { memo, useCallback, useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useInfinitePlans, usePlanStore } from '../hooks';
import BudgetPlanCard from '../molecules/BudgetCard';
import { usePreferences } from '@/components/Settings/hooks';

function ExpensesScreen() {
    const { setExpensePlans, expensePlans } = usePlanStore();
    const {
        preferences: { hideCompletedPlans },
    } = usePreferences();
    const { data, fetchNextPage, hasNextPage, isLoading, refetch } = useInfinitePlans({
        requestQuery: {
            type: 'expense',
            page_size: 10,
            is_completed: false,
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
            refetchOnWindowFocus: 'always',
        },
    });

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch]),
    );

    const itemSeparator = useCallback(() => <View style={styles.itemSeparator} />, []);
    const renderEmptylist = useCallback(
        () => (
            <View className='my-10'>
                <EmptyList message="Looks like you haven't created any budgets yet." />
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
