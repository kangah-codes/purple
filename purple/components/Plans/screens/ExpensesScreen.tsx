import { View } from '@/components/Shared/styled';
import { keyExtractor } from '@/lib/utils/number';
import { memo, useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { expensePlans } from '../constants';
import BudgetPlanCard from '../molecules/BudgetCard';
import BudgetInfoCard from '../molecules/BudgetInfoCard';
import { BudgetPlan, Plan } from '../schema';
import { usePlans, usePlanStore } from '../hooks';
import { GenericAPIResponse } from '@/@types/request';
import { SessionData } from '@/components/Auth/schema';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/components/Auth/hooks';
import EmptyList from '@/components/Shared/molecules/ListStates/Empty';

function ExpensesScreen() {
    const { setExpensePlans, expensePlans } = usePlanStore();
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
    const { isLoading, refetch } = usePlans({
        sessionData: sessionData as SessionData,
        options: {
            onSuccess: (data) => {
                const res = data as GenericAPIResponse<Plan[]>;
                setExpensePlans(res.data);
            },
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
        requestParams: {
            type: 'expense',
        },
    });

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
