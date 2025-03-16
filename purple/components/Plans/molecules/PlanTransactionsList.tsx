import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import { Text, View } from '@/components/Shared/styled';
import { Transaction } from '@/components/Transactions/schema';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { keyExtractor } from '@/lib/utils/number';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { usePlanStore } from '../hooks';
import PlanTransactionHistoryCard from '../molecules/PlanTransactionHistoryCard';

export default function PlanTransactionsList() {
    const { currentPlan } = usePlanStore();

    const renderItem = useCallback(
        ({ item }: { item: Transaction }) => <PlanTransactionHistoryCard data={item} />,
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
        () => <View className='border-b border-purple-100' />,
        [],
    );

    if (!currentPlan) return null;

    return (
        <View className='flex flex-col px-5 mt-5'>
            <View className='flex flex-row w-full justify-between items-center'>
                <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-lg text-black'>
                    Transactions
                </Text>
            </View>

            <FlashList
                estimatedItemSize={40}
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
    },
});
