import { useAuth } from '@/components/Auth/hooks';
import { SessionData } from '@/components/Auth/schema';
import CustomBottomSheetFlatList from '@/components/Shared/molecules/GlobalBottomSheetFlatList';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import Heatmap, { CellData } from '@/components/Shared/molecules/Heatmap';
import { colors } from '@/components/Shared/molecules/Heatmap/constants';
import { getColorIndex } from '@/components/Shared/molecules/Heatmap/utils';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { StarsIcon } from '@/components/SVG/24x24';
import { useInfiniteTransactions, useTransactionStore } from '@/components/Transactions/hooks';
import TransactionHistoryCard from '@/components/Transactions/molecules/TransactionHistoryCard';
import { Transaction } from '@/components/Transactions/schema';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { Portal } from '@gorhom/portal';
import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from 'date-fns';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useStatsStore } from '../hooks';
import HeatmapLoading from './HeatmapLoading';
import { groupBy } from '@/lib/utils/helpers';

const now = new Date();
const start = startOfMonth(now);
const end = endOfMonth(now);
const deviceWidth = Dimensions.get('window').width;
const padding = 20;
const numBlocksPerRow = 7; // for a week view
const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const monthDays = eachDayOfInterval({ start, end });
const offset = new Date(monthDays[0].getFullYear(), monthDays[0].getMonth(), 1).getDay();
const offsetData = Array(offset).fill({ value: 0, key: '', index: 0 });
const finalMonthDays = [...offsetData, ...monthDays];
const blockSize = (deviceWidth - padding * 2 - 28) / numBlocksPerRow;

function StatsHeatmap() {
    const { sessionData } = useAuth();
    const { isStatsLoading, setStats, stats, setIsStatsLoading } = useStatsStore();
    const [selectedDate, setSelectedDate] = useState<string | null>();
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();
    const { transactions } = useTransactionStore();

    const heatmapData = useMemo(
        () =>
            monthDays.map((day, index) => {
                const formattedTransactions = transactions.map((transaction) => ({
                    ...transaction,
                    created_at_formatted: format(new Date(transaction.created_at), 'dd/MM/yy'),
                }));
                const date = format(day, 'dd/MM/yy');
                const groupedTransactions = groupBy(formattedTransactions, 'created_at_formatted');

                return {
                    value: groupedTransactions[date]?.length ?? 0,
                    key: format(day, 'dd/MM/yyyy'),
                    index: index + offset,
                };
            }),
        [monthDays, stats, transactions],
    );

    const renderCell = useCallback(
        (data: CellData) => {
            const maxValue = Math.max(...heatmapData.map((d) => d.value));
            const colorIndex = getColorIndex(data.value, 0, maxValue, colors.length);

            if (format(now, 'dd/MM/yyyy') === data.key) {
                return (
                    <TouchableOpacity key={data.key}>
                        <LinearGradient
                            style={styles.linearGradient}
                            colors={colors[colorIndex]}
                            className='flex items-center justify-center'
                        >
                            <StarsIcon stroke='#fff' fill={'#fff'} />
                        </LinearGradient>
                    </TouchableOpacity>
                );
            }
        },
        [stats],
    );

    // TODO: come back to this in the future
    // const click = useCallback(
    //     (item: CellData) => {
    //         const newDate = format(finalMonthDays[item.index], 'dd/MM/yyyy');
    //         if (newDate !== selectedDate) {
    //             setSelectedDate(newDate);
    //             setShowBottomSheetFlatList('statsDailyTransactionBreakdownList', true);
    //         }
    //     },
    //     [selectedDate],
    // );

    const itemSeparator = useCallback(() => <View className='border-b border-gray-100' />, []);
    const renderItem = useCallback(
        ({ item }: { item: any }) => <TransactionHistoryCard data={item} onPress={() => {}} />,
        [],
    );

    return (
        <View className='flex flex-col space-y-2.5 px-5'>
            <Text className='text-base text-black' style={GLOBAL_STYLESHEET.satoshiBlack}>
                Daily Activity
            </Text>
            <View>
                <View className='flex flex-row justify-between py-2'>
                    {days.map((day, key) => (
                        <Text
                            key={key}
                            className='text-black text-xs mx-auto'
                            style={GLOBAL_STYLESHEET.satoshiBlack}
                        >
                            {day}
                        </Text>
                    ))}
                </View>
                {isStatsLoading ? (
                    <HeatmapLoading blockSize={blockSize} />
                ) : (
                    <Heatmap
                        cellSize={blockSize}
                        rows={4}
                        cols={numBlocksPerRow}
                        data={heatmapData}
                        // onPressCallback={click}
                        startColumn={getDay(start)}
                        renderCell={renderCell}
                    />
                )}
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
        borderRadius: 8,
    },
});

export default StatsHeatmap;
