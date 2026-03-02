import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import { View } from '@/components/Shared/styled';
import { keyExtractor } from '@/lib/utils/number';
import { useFocusEffect } from 'expo-router';
import React, { memo, useCallback, useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useInfinitePlans, usePlanStore } from '../hooks';
import BudgetPlanCard from '../molecules/BudgetCard';
import { usePreferences } from '@/components/Settings/hooks';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';

function SavingsScreen() {
    const { setSavingPlans, savingPlans } = usePlanStore();
    const {
        preferences: { hideCompletedPlans },
    } = usePreferences();
    const { data, fetchNextPage, hasNextPage, isLoading, isError, refetch, isFetching } =
        useInfinitePlans({
            requestQuery: {
                type: 'saving',
                page_size: 10,
                is_completed: hideCompletedPlans ? false : undefined,
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
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch]),
    );
    useScreenTracking('plan_budgets', {
        source: 'navigation',
    });

    const itemSeparator = useCallback(() => <View style={styles.itemSeparator} />, []);
    const renderEmptylist = useCallback(
        () => (
            <View className='my-10'>
                <EmptyList message="Looks like you haven't created any saving plans yet." />
            </View>
        ),
        [],
    );
    const listHeader = useCallback(() => {
        if (savingPlans.length === 0) return null;
        return (
            <View className='flex flex-col space-y-5 -px-5'>
                {/* <PlanInfoCard type='saving' /> */}
                <View style={styles.listHeaderView} />
            </View>
        );
    }, [savingPlans]);

    useEffect(() => {
        if (data) {
            const tx = data.pages.flatMap((page) => page.data);
            setSavingPlans(tx);
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
            numColumns={2}
            columnWrapperStyle={{ gap: 10 }}
            showsHorizontalScrollIndicator={false}
            data={savingPlans}
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
    container: {},
    contentContainer: {
        paddingBottom: 100,
        paddingHorizontal: 20,
    },
    listHeaderView: {
        // marginTop: 20,
    },
    itemSeparator: {
        height: 20,
    },
});
export default memo(SavingsScreen);
