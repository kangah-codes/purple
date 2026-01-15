import Heatmap, { CellData } from '@/components/Shared/molecules/Heatmap';
import { colors } from '@/components/Shared/molecules/Heatmap/constants';
import { LinearGradient, Text, View } from '@/components/Shared/styled';
import { CheckMarkIcon } from '@/components/SVG/icons/noscale';
import { satoshiFont } from '@/lib/constants/fonts';
import { groupBy } from '@/lib/utils/helpers';
import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from 'date-fns';
import React, { useCallback, useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useUpcomingRecurringTransactions } from '../hooks';
import UpcomingTransactionCard from './UpcomingTransactionCard';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';

const now = new Date();
const start = startOfMonth(now);
const end = endOfMonth(now);
const deviceWidth = Dimensions.get('window').width / 1.7;
const padding = 20;
const numBlocksPerRow = 7;
const monthDays = eachDayOfInterval({ start, end });
const offset = monthDays[0].getDay();
const blockSize = (deviceWidth - padding * 2 - 28) / numBlocksPerRow;
const startDate = startOfMonth(now);
const endDate = endOfMonth(now);

export default function RecurringTransactionsWidget() {
    const { data, refetch } = useUpcomingRecurringTransactions({
        // its ok to use infinity here since we WANT to fetch all
        // recurring tx within the month
        // TODO: I should probably refactor the hook or add a new one to return
        // limited data since thats only what we need
        requestQuery: { startDate, endDate, n: Infinity },
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

    const transactions = useMemo(() => {
        const txs = (data?.data ?? []).map((transaction) => ({
            ...transaction,
            create_next_at_formatted: format(new Date(transaction.create_next_at), 'yyyy-MM-dd'),
        }));
        const sorted = txs.sort(
            (a, b) => new Date(a.create_next_at).getTime() - new Date(b.create_next_at).getTime(),
        );
        const upcoming = sorted.filter((tx) => new Date(tx.create_next_at) >= now);
        return {
            transactions: sorted,
            slicedTransactions: upcoming.slice(0, 3), // show only the next 3 upcoming transactions
        };
    }, [data]);

    const heatmapData = useMemo(() => {
        const groupedTransactions = groupBy(transactions.transactions, 'create_next_at_formatted');
        return monthDays.map((day, index) => {
            const date = format(day, 'yyyy-MM-dd');
            return {
                value: groupedTransactions[date]?.length ?? 0,
                key: date,
                index: index + offset,
            };
        });
    }, [monthDays, transactions]);

    const expectedOccurrences = useMemo(() => {
        const occurrencesSet = new Set<string>();

        (data?.data ?? []).forEach((recurring) => {
            const key = format(new Date(recurring.create_next_at), 'yyyy-MM-dd');
            occurrencesSet.add(key);
        });

        return occurrencesSet;
    }, [data]);

    const renderCell = useCallback(
        (data: CellData) => {
            const hasScheduled = expectedOccurrences.has(data.key);
            const showCheckmark = hasScheduled && new Date(data.key) <= now;
            const cellColors = hasScheduled ? colors[4] : colors[0];

            return (
                <LinearGradient
                    style={styles.linearGradient}
                    colors={cellColors}
                    className='flex items-center justify-center'
                >
                    {showCheckmark && (
                        <CheckMarkIcon stroke='#fff' width={16} height={16} strokeWidth={3} />
                    )}
                </LinearGradient>
            );
        },
        [expectedOccurrences],
    );

    useRefreshOnFocus(refetch);

    if (transactions.transactions.length === 0) return null;

    return (
        <View className='w-full space-y-5 flex flex-col px-5 mb-5'>
            <View className='flex flex-row w-full justify-between'>
                <View className='w-[38%] flex flex-col justify-between items-start'>
                    <View className='bg-purple-50 px-2 py-1 rounded-full'>
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-500'>
                            This month
                        </Text>
                    </View>
                    <View className='flex flex-col'>
                        <Text style={satoshiFont.satoshiBlack} className='text-[50px] text-black'>
                            {transactions.transactions.length}
                        </Text>
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-500'>
                            Recurring Transaction
                            {transactions.transactions.length === 1 ? '' : 's'}
                        </Text>
                    </View>
                </View>
                <View className='w-[58%]'>
                    <Heatmap
                        cellSize={blockSize}
                        rows={4}
                        cols={numBlocksPerRow}
                        data={heatmapData}
                        startColumn={getDay(start)}
                        renderCell={renderCell}
                    />
                </View>
            </View>

            <View className='h-[1px] border-b border-purple-100' />

            {transactions.slicedTransactions.length > 0 && (
                <View className='flex flex-col space-y-2.5'>
                    <Text style={satoshiFont.satoshiBlack} className='text-base text-black'>
                        Upcoming
                    </Text>

                    <View className='flex flex-col space-y-2'>
                        {transactions.slicedTransactions.map((transaction, index) => {
                            return (
                                <>
                                    <UpcomingTransactionCard
                                        transaction={transaction}
                                        key={index}
                                    />
                                    {index !== transactions.slicedTransactions.length - 1 && (
                                        <View className='h-1 border-b border-purple-100' />
                                    )}
                                </>
                            );
                        })}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    linearGradient: {
        width: blockSize,
        height: blockSize,
        margin: 2,
        borderRadius: 6,
    },
});
