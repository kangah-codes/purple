import Heatmap, { CellData } from '@/components/Shared/molecules/Heatmap';
import { colors } from '@/components/Shared/molecules/Heatmap/constants';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { ChevronRightIcon } from '@/components/SVG/icons/16x16';
import { CheckMarkIcon } from '@/components/SVG/icons/noscale';
import { satoshiFont } from '@/lib/constants/fonts';
import { groupBy } from '@/lib/utils/helpers';
import { formatCurrencyRounded } from '@/lib/utils/number';
import {
    eachDayOfInterval,
    endOfMonth,
    format,
    getDay,
    getDaysInMonth,
    startOfMonth,
} from 'date-fns';
import React, { useCallback, useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useRecurringTransactions } from '../hooks';
import { getTransactionColour } from '../utils';

const now = new Date();
const start = startOfMonth(now);
const end = endOfMonth(now);
const deviceWidth = Dimensions.get('window').width / 1.7;
const padding = 20;
const numBlocksPerRow = 7;
const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const monthDays = eachDayOfInterval({ start, end });
const offset = monthDays[0].getDay();
const offsetData = Array(offset).fill({ value: 0, key: '', index: 0 });
const finalMonthDays = [...offsetData, ...monthDays];
const blockSize = (deviceWidth - padding * 2 - 28) / numBlocksPerRow;

export default function RecurringTransactionsWidget() {
    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(new Date());
    const { data } = useRecurringTransactions({
        requestQuery: { startDate, endDate, n: getDaysInMonth(new Date()) },
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

    console.log(data);

    const transactions = useMemo(() => {
        const txs = (data?.data ?? []).map((transaction) => ({
            ...transaction,
            create_next_at_formatted: format(new Date(transaction.create_next_at), 'yyyy-MM-dd'),
        }));
        const sorted = txs.sort(
            (a, b) => new Date(a.create_next_at).getTime() - new Date(b.create_next_at).getTime(),
        );
        return {
            transactions: sorted,
            slicedTransactions: sorted.slice(0, 5),
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

    const renderCell = useCallback(
        (data: CellData) => {
            const hasTransactions = data.value > 0;
            const cellColors = hasTransactions ? colors[4] : colors[0];

            return (
                <LinearGradient
                    style={styles.linearGradient}
                    colors={cellColors}
                    className='flex items-center justify-center'
                >
                    {hasTransactions && new Date(data.key) < now && (
                        <CheckMarkIcon stroke='#fff' width={16} height={16} />
                    )}
                </LinearGradient>
            );
        },
        [heatmapData],
    );

    if (transactions.transactions.length === 0) return null;

    return (
        <View className='w-full space-y-5 flex flex-col'>
            <View className='flex flex-row w-full justify-between'>
                <View className='w-[38%] flex flex-col justify-between items-start'>
                    <View className='px-2 py-0.5 flex items-center justify-center border border-purple-100 rounded-full'>
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-600'>
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

            <View className='flex flex-col space-y-2.5'>
                <Text style={satoshiFont.satoshiBlack} className='text-base text-black'>
                    Upcoming
                </Text>

                <View className='flex flex-col space-y-2'>
                    {transactions.slicedTransactions.map((transaction, index) => {
                        const nextDate = new Date(transaction.create_next_at);
                        return (
                            <TouchableOpacity
                                key={transaction.id}
                                className='flex flex-row items-center justify-between space-x-2'
                            >
                                <View className='flex flex-row items-center space-x-2'>
                                    <View className='flex flex-col p-2.5 bg-purple-50 rounded-xl items-center'>
                                        <Text
                                            style={satoshiFont.satoshiBold}
                                            className='text-xs text-purple-500'
                                        >
                                            {format(nextDate, 'MMM')}
                                        </Text>
                                        <Text
                                            style={satoshiFont.satoshiBlack}
                                            className='text-sm text-purple-600'
                                        >
                                            {format(nextDate, 'dd')}
                                        </Text>
                                    </View>
                                    <View className='flex flex-col'>
                                        <Text style={satoshiFont.satoshiBlack} className='text-sm'>
                                            {transaction.category}
                                        </Text>
                                        <Text
                                            style={satoshiFont.satoshiBold}
                                            className='text-xs text-purple-500'
                                        >
                                            {format(nextDate, 'hh:mm a')}
                                        </Text>
                                    </View>
                                </View>

                                <View className='flex flex-row space-x-2 items-center'>
                                    <Text
                                        style={[
                                            satoshiFont.satoshiBlack,
                                            { color: getTransactionColour(transaction.type) },
                                        ]}
                                        className='text-sm'
                                    >
                                        {transaction.type === 'debit'
                                            ? '-'
                                            : transaction.type === 'credit'
                                            ? '+'
                                            : ''}
                                        {formatCurrencyRounded(transaction.amount, 'GHS')}
                                    </Text>

                                    <ChevronRightIcon stroke='#9333ea' />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
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
