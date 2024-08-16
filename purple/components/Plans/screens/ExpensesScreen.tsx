import { View } from '@/components/Shared/styled';
import { keyExtractor } from '@/lib/utils/number';
import { memo, useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { expensePlans } from '../constants';
import BudgetPlanCard from '../molecules/BudgetCard';
import BudgetInfoCard from '../molecules/BudgetInfoCard';
import { BudgetPlan } from '../schema';

function ExpensesScreen() {
    const itemSeparator = useCallback(() => <View style={styles.itemSeparator} />, []);
    const renderItem = useCallback(
        ({ item }: { item: BudgetPlan }) => <BudgetPlanCard data={item} />,
        [],
    );
    const listHeader = useCallback(
        () => (
            <View>
                <BudgetInfoCard />
                <View style={styles.listHeaderView} />
            </View>
        ),
        [],
    );

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
