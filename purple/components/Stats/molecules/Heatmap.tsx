import { StarsIcon } from '@/components/SVG/24x24';
import Heatmap, { CellData } from '@/components/Shared/molecules/Heatmap';
import { colors } from '@/components/Shared/molecules/Heatmap/constants';
import { getColorIndex } from '@/components/Shared/molecules/Heatmap/utils';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import TransactionHistoryCard from '@/components/Transactions/molecules/TransactionHistoryCard';
import { Transaction } from '@/components/Transactions/schema';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { groupBy } from '@/lib/utils/helpers';
import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from 'date-fns';
import React, { useCallback, useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';

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

type StatsHeatmapProps = {
    transactions: Transaction[];
};

function StatsHeatmap({ transactions }: StatsHeatmapProps) {
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
        [monthDays, transactions],
    );

    const renderCell = useCallback((data: CellData) => {
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
    }, []);

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
            <Heatmap
                cellSize={blockSize}
                rows={4}
                cols={numBlocksPerRow}
                data={heatmapData}
                // onPressCallback={click}
                startColumn={getDay(start)}
                renderCell={renderCell}
            />
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
