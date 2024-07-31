import { View } from '@/components/Shared/styled';
import { FlatList } from 'react-native';
import { expensePlans } from '../constants';
import BudgetPlanCard from '../molecules/BudgetCard';
import ExpensesCard from '../molecules/ExpensesCard';
import { memo, useCallback } from 'react';
import { BudgetPlan } from '../schema';

function ExpensesScreen() {
    const itemSeparator = useCallback(() => <View style={{ height: 20 }} />, []);
    const renderItem = useCallback(
        ({ item }: { item: BudgetPlan }) => <BudgetPlanCard data={item} />,
        [],
    );
    const listHeader = useCallback(
        () => (
            <View>
                <ExpensesCard />
                <View style={{ marginTop: 20 }} />
            </View>
        ),
        [],
    );

    return (
        <FlatList
            contentContainerStyle={{ paddingBottom: 100 }}
            style={{ paddingHorizontal: 20 }}
            showsHorizontalScrollIndicator={false}
            data={expensePlans}
            renderItem={renderItem}
            keyExtractor={(_, index) => index.toString()}
            ItemSeparatorComponent={itemSeparator}
            initialNumToRender={5}
            ListHeaderComponent={listHeader}
        />
    );
}

export default memo(ExpensesScreen);
