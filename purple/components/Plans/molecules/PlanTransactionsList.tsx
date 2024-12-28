import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import { View } from '@/components/Shared/styled';
import { keyExtractor } from '@/lib/utils/number';
import React, { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { usePlanStore } from '../hooks';
import PlanTransactionHistoryCard from '../molecules/PlanTransactionHistoryCard';
import { PlanTransaction } from '../schema';

export default function PlanTransactionsList() {
    const { currentPlan } = usePlanStore();

    const renderItem = useCallback(
        ({ item }: { item: PlanTransaction }) => <PlanTransactionHistoryCard data={item} />,
        [],
    );
    const renderEmptylist = useCallback(
        () => (
            <View className='my-20'>
                <EmptyList message="Looks like you haven't created any transactions for this plan yet." />
            </View>
        ),
        [],
    );
    const renderItemSeparator = useCallback(
        () => <View className='border-b border-gray-100' />,
        [],
    );

    if (!currentPlan) return null;

    return (
        <View>
            <FlatList
                data={currentPlan.Transactions}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={true}
                renderItem={renderItem}
                ItemSeparatorComponent={renderItemSeparator}
                ListEmptyComponent={renderEmptylist}
                onEndReachedThreshold={0.5}
                scrollEnabled={false}
            />
        </View>
    );
}
const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 100,
        paddingHorizontal: 20,
    },
});
