import Heatmap, { CellData } from '@/components/Shared/molecules/Heatmap';
import { colors } from '@/components/Shared/molecules/Heatmap/constants';
import { getColorIndex } from '@/components/Shared/molecules/Heatmap/utils';
import { LinearGradient, Text, View, TouchableOpacity } from '@/components/Shared/styled';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/SVG/icons/24x24';
import { CheckMarkIcon } from '@/components/SVG/icons/noscale';
import { satoshiFont } from '@/lib/constants/fonts';
import { groupBy } from '@/lib/utils/helpers';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from 'date-fns';
import { router } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';

const now = new Date();
const start = startOfMonth(now);
const end = endOfMonth(now);
// TODO: calculate width dynamically of view and move this to state
const deviceWidth = Dimensions.get('window').width / 1.7; // idk i just did trial and error
const padding = 20;
const numBlocksPerRow = 7; // for a week view
const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const monthDays = eachDayOfInterval({ start, end });
const offset = new Date(monthDays[0].getFullYear(), monthDays[0].getMonth(), 1).getDay();
const offsetData = Array(offset).fill({ value: 0, key: '', index: 0 });
const finalMonthDays = [...offsetData, ...monthDays];
const blockSize = (deviceWidth - padding * 2 - 28) / numBlocksPerRow;

const tx = [
    {
        palette: ['#05df72', '#008236'],
        emoji: '💰 Stock Dividends',
    },
    {
        palette: ['#ff4d4d', '#ff0000'],
        emoji: '💸 Loans',
    },
    {
        palette: ['#ffb84d', '#ff8c00'],
        emoji: '💳 Credit Card',
    },
];

// @ts-ignore
export default function RecurringTransactionsWidget({ transactions = tx }) {
    const heatmapData = useMemo(
        () =>
            monthDays.map((day, index) => {
                // @ts-ignore
                const formattedTransactions = transactions.map((transaction) => ({
                    ...transaction,
                    created_at_formatted: format(new Date(), 'dd/MM/yy'),
                }));
                const date = format(day, 'dd/MM/yy');
                const groupedTransactions = groupBy(formattedTransactions, 'created_at_formatted');

                return {
                    value: groupedTransactions[date]?.length ?? 0,
                    key: format(day, 'dd/MM/yyyy'),
                    index: index + offset,
                };
            }),
        [monthDays, transactions],
    );

    const renderCell = useCallback(
        (data: CellData) => {
            const maxValue = Math.max(...heatmapData.map((d) => d.value));
            const colorIndex = getColorIndex(data.value, 0, maxValue, colors.length);
            const isRandomHighlightDay = data.key.charCodeAt(0) % 3 === 0;

            if (format(now, 'dd/MM/yyyy') === data.key) {
                return (
                    <LinearGradient
                        style={styles.linearGradient}
                        colors={colors[4]}
                        className='flex items-center justify-center'
                    />
                );
            } else if (isRandomHighlightDay) {
                return (
                    <LinearGradient
                        style={styles.linearGradient}
                        colors={colors[4]}
                        className='flex items-center justify-center'
                    >
                        <CheckMarkIcon stroke='#fff' width={16} height={16} />
                    </LinearGradient>
                );
            }
        },
        [heatmapData],
    );

    return (
        <View className=' rounded-3xl border-purple-100 w-full space-y-5 flex flex-col overflow-'>
            {/* <Text className='text-lg' style={satoshiFont.satoshiBold}>
                Recurring Transactions
            </Text> */}
            <View className='flex flex-row w-full justify-between'>
                <View className='w-[38%] flex flex-col justify-between items-start'>
                    <View className='px-2 py-0.5 flex items-center justify-center border border-purple-100 rounded-full'>
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-600'>
                            This month
                        </Text>
                    </View>
                    <View className='flex flex-col'>
                        <Text
                            style={satoshiFont.satoshiBlack}
                            className='text-[50px] text-purple-600'
                        >
                            12
                        </Text>
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-500'>
                            Recurring Transactions
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
                <View className='flex flex-row justify-between'>
                    <Text style={satoshiFont.satoshiBlack} className='text-base text-purple-600'>
                        Upcoming
                    </Text>

                    <View className='flex flex-row items-center space-x-1'>
                        <TouchableOpacity
                            onPress={router.back}
                            className='bg-purple-50 px-4 py-2 flex items-center justify-center rounded-full'
                        >
                            <ArrowLeftIcon stroke='#9333EA' strokeWidth={2.5} height={16} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={router.back}
                            className='bg-purple-50 px-4 py-2 flex items-center justify-center rounded-full'
                        >
                            <ArrowRightIcon stroke='#9333EA' strokeWidth={2.5} height={16} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View className='flex flex-col space-y-2'>
                    {transactions.slice(0, 3).map((transaction, index) => (
                        <View
                            key={index}
                            className='flex flex-row items-center justify-between space-x-2'
                        >
                            <View className='flex flex-row items-center space-x-2'>
                                {/* <View className='flex items-center justify-center w-8 h-8 rounded-xl bg-purple-50'>
                                <Text
                                    style={satoshiFont.satoshiBold}
                                    className='text-sm text-white'
                                >
                                    {transaction.emoji}
                                </Text>
                            </View> */}
                                <View className='flex flex-col p-2.5 bg-purple-50 rounded-xl items-center'>
                                    <Text
                                        style={satoshiFont.satoshiBold}
                                        className='text-xs text-purple-500'
                                    >
                                        Sep
                                    </Text>
                                    <Text
                                        style={satoshiFont.satoshiBlack}
                                        className='text-sm text-purple-600'
                                    >
                                        11
                                    </Text>
                                </View>
                                <View className='flex flex-col'>
                                    <Text style={satoshiFont.satoshiBlack} className='text-sm'>
                                        {transaction.emoji}
                                    </Text>
                                    <Text
                                        style={satoshiFont.satoshiBold}
                                        className='text-xs text-purple-500'
                                    >
                                        Monthly
                                    </Text>
                                </View>
                            </View>
                            <Text
                                style={satoshiFont.satoshiBlack}
                                className='text-sm text-[#00a63e]'
                            >
                                +{formatCurrencyRounded(1000, 'USD')}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    bottomSheetContainer: {
        paddingHorizontal: 20,
    },
    handleIndicator: {
        backgroundColor: '#D4D4D4',
    },
    flatlistContentContainer: {
        paddingBottom: 100,
        paddingHorizontal: 20,
        backgroundColor: 'white',
    },
    linearGradient: {
        width: blockSize,
        height: blockSize,
        margin: 2,
        borderRadius: 6,
    },
});
