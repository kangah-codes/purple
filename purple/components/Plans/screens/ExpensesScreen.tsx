import { View } from '@/components/Shared/styled';
import { keyExtractor } from '@/lib/utils/number';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { expensePlans } from '../constants';
import BudgetPlanCard from '../molecules/BudgetCard';
import BudgetInfoCard from '../molecules/BudgetInfoCard';
import { BudgetPlan, Plan } from '../schema';
import { useInfinitePlans, usePlans, usePlanStore } from '../hooks';
import { GenericAPIResponse } from '@/@types/request';
import { SessionData } from '@/components/Auth/schema';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/components/Auth/hooks';
import EmptyList from '@/components/Shared/molecules/ListStates/Empty';

function ExpensesScreen() {
    const { setExpensePlans, expensePlans, updateExpenseplans } = usePlanStore();
    const { sessionData } = useAuth();
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
            <View>
                <BudgetInfoCard />
                <View style={styles.listHeaderView} />
            </View>
        );
    }, []);

    const { data, fetchNextPage, hasNextPage, isLoading, isError, refetch, isFetching } =
        useInfinitePlans({
            sessionData: sessionData as SessionData,
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
                            text2: "We couldn't fetch your transactions",
                        },
                    });
                },
            },
        });

    // flatten the data
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
            showsHorizontalScrollIndicator={false}
            data={expensePlans}
            renderItem={renderItem}
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
    },
    listHeaderView: {
        marginTop: 20,
    },
    itemSeparator: {
        height: 20,
    },
});
export default memo(ExpensesScreen);
