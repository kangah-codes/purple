import { transactionData } from '@/components/Index/constants';
import CustomBottomSheetFlatList from '@/components/Shared/molecules/GlobalBottomSheetFlatList';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import Heatmap, { CellData } from '@/components/Shared/molecules/Heatmap';
import { colors } from '@/components/Shared/molecules/Heatmap/constants';
import { getColorIndex } from '@/components/Shared/molecules/Heatmap/utils';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { StarsIcon } from '@/components/SVG/24x24';
import TransactionHistoryCard from '@/components/Transactions/molecules/TransactionHistoryCard';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { deepCompare } from '@/lib/utils/object';
import { Portal } from '@gorhom/portal';
import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from 'date-fns';
import { memo, useCallback, useMemo, useState } from 'react';
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

function StatsHeatmap() {
    const [selectedDate, setSelectedDate] = useState<string | null>();
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();

    const values = useMemo(
        () => finalMonthDays.map(() => Math.floor(Math.random() * 24)),
        [finalMonthDays],
    );

    const data = useMemo(
        () =>
            monthDays.map((day, index) => ({
                value: values[index],
                key: format(day, 'dd/MM/yyyy'),
                index: index + offset,
            })),
        [values],
    );

    const click = useCallback(
        (item: CellData) => {
            const newDate = format(finalMonthDays[item.index], 'dd/MM/yyyy');
            if (newDate !== selectedDate) {
                setSelectedDate(newDate);
                setShowBottomSheetFlatList('statsDailyTransactionBreakdownList', true);
            }
        },
        [selectedDate],
    );

    const handleCellPress = useCallback(
        (data: CellData) => {
            setSelectedDate(data.key);
            setShowBottomSheetFlatList('statsDailyTransactionBreakdownList', true);
        },
        [data],
    );

    const renderCell = useCallback(
        (data: CellData, index: number) => {
            const colorIndex = getColorIndex(values[index], 0, Math.max(...values), colors.length);

            if (format(now, 'dd/MM/yyyy') === data.key)
                return (
                    <TouchableOpacity key={data.key} onPress={() => handleCellPress(data)}>
                        <LinearGradient
                            style={styles.linearGradient}
                            colors={colors[colorIndex]}
                            className='flex items-center justify-center'
                        >
                            <StarsIcon stroke='#fff' fill={'#fff'} />
                        </LinearGradient>
                    </TouchableOpacity>
                );

            return undefined;
        },
        [data],
    );

    const itemSeparator = useCallback(() => <View className='border-b border-gray-100' />, []);
    const renderItem = useCallback(
        ({ item }: { item: any }) => <TransactionHistoryCard data={item} onPress={() => {}} />,
        [],
    );

    return (
        <>
            <Portal>
                <CustomBottomSheetFlatList
                    snapPoints={['50%', '70%']}
                    children={
                        <Text
                            style={GLOBAL_STYLESHEET.suprapower}
                            className='text-base text-gray-900 px-5 py-2.5'
                        >
                            Transactions on {selectedDate}
                        </Text>
                    }
                    sheetKey={'statsDailyTransactionBreakdownList'}
                    data={transactionData}
                    renderItem={renderItem}
                    containerStyle={styles.bottomSheetContainer}
                    handleIndicatorStyle={styles.handleIndicator}
                    flatListContentContainerStyle={styles.flatlistContentContainer}
                    itemSeparator={itemSeparator}
                />
            </Portal>
            <>
                <View className='flex flex-row justify-between'>
                    {days.map((day, key) => (
                        <Text
                            key={key}
                            className='text-black text-base mx-auto'
                            style={GLOBAL_STYLESHEET.interSemiBold}
                        >
                            {day}
                        </Text>
                    ))}
                </View>
                <Heatmap
                    cellSize={blockSize}
                    rows={4}
                    cols={numBlocksPerRow}
                    data={data}
                    onPressCallback={click}
                    startColumn={getDay(start)}
                    renderCell={renderCell}
                />
            </>
        </>
    );
}

function arePropsEqual(prevProps: any, nextProps: any) {
    return deepCompare(prevProps, nextProps);
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

export default memo(StatsHeatmap, arePropsEqual);
