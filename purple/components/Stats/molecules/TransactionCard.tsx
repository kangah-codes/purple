import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import TransactionHistoryCard from '@/components/Transactions/molecules/TransactionHistoryCard';
import { Transaction } from '@/components/Transactions/schema';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { formatDateTime } from '@/lib/utils/date';
import { formatCurrencyAccurate, keyExtractor } from '@/lib/utils/number';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet } from 'react-native';

export default function TransactionCard({
    groupName,
    transactions,
}: {
    groupName: string;
    transactions: Transaction[];
}) {
    const router = useRouter();
    const renderItemSeparator = useCallback(() => <View style={styles.separator} />, []);
    const calculateTotalBalance = useMemo(() => {
        return transactions.reduce((acc, curr) => acc + curr.amount, 0);
    }, [transactions]);
    const renderItem = ({ item, index }: { item: Transaction; index: number }) => (
        <TransactionHistoryCard data={item} onPress={() => {}} />
    );

    return (
        <>
            <View className='flex flex-row items-center justify-between py-2.5'>
                <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-black'>
                    {formatDateTime(transactions[0].created_at).date}
                </Text>
                <Text
                    style={[
                        GLOBAL_STYLESHEET.satoshiBlack,
                        {
                            color: calculateTotalBalance >= 0 ? '#15803D' : '#FF3D71',
                        },
                    ]}
                    className='text-sm'
                >
                    {formatCurrencyAccurate(
                        transactions[0].currency,
                        transactions.reduce((acc, curr) => acc + curr.amount, 0),
                    )}
                </Text>
            </View>
            <View className='flex flex-col divide-y divide-purple-50'>
                <FlatList
                    data={transactions}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    ItemSeparatorComponent={renderItemSeparator}
                    scrollEnabled={false} // Disable scrolling for the nested FlatList
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    separator: {
        height: 1,
        backgroundColor: '#E9D8FD', // divide-purple-200
    },
});
