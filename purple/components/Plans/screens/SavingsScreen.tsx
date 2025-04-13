import { GenericAPIResponse } from '@/@types/request';
import { useAuth } from '@/components/Auth/hooks';
import { SessionData } from '@/components/Auth/schema';
import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import { View } from '@/components/Shared/styled';
import { keyExtractor } from '@/lib/utils/number';
import React, { memo, useCallback, useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useInfinitePlans, usePlanStore, usePlans } from '../hooks';
import BudgetPlanCard from '../molecules/BudgetCard';
import PlanInfoCard from '../molecules/PlanInfoCard';
import { Plan } from '../schema';

function SavingsScreen() {
    const { sessionData } = useAuth();
    const { setSavingPlans, savingPlans } = usePlanStore();
    const { data, fetchNextPage, hasNextPage, isLoading, isError, refetch, isFetching } =
        useInfinitePlans({
            sessionData: sessionData as SessionData,
            requestQuery: {
                type: 'saving',
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

    const itemSeparator = useCallback(() => <View style={styles.itemSeparator} />, []);
    const renderItem = useCallback(
        ({ item }: { item: Plan }) => <BudgetPlanCard data={item} />,
        [],
    );
    const renderEmptylist = useCallback(
        () => (
            <View className='my-20'>
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
            style={styles.container}
            showsHorizontalScrollIndicator={false}
            data={savingPlans}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={itemSeparator}
            initialNumToRender={5}
            ListHeaderComponent={listHeader}
            refreshing={isLoading}
            onRefresh={refetch}
            ListEmptyComponent={renderEmptylist}
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
