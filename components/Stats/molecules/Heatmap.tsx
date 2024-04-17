import { transactionData } from '@/components/Index/constants';
import CustomBottomSheetFlatList from '@/components/Shared/molecules/GlobalBottomSheetFlatList';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import Heatmap, { CellData } from '@/components/Shared/molecules/Heatmap';
import { colors } from '@/components/Shared/molecules/Heatmap/constants';
import { getColorIndex } from '@/components/Shared/molecules/Heatmap/utils';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { StarsIcon } from '@/components/SVG/24x24';
import TransactionHistoryCard from '@/components/Transactions/molecules/TransactionHistoryCard';
import { deepCompare } from '@/lib/utils/object';
import { Portal } from '@gorhom/portal';
import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from 'date-fns';
import { memo, useCallback, useMemo, useState } from 'react';
import { Dimensions } from 'react-native';

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

    const renderCell = useCallback(
        (data: CellData, index: number) => {
            const colorIndex = getColorIndex(values[index], 0, Math.max(...values), colors.length);

            if (format(now, 'dd/MM/yyyy') === data.key)
                return (
                    <TouchableOpacity key={data.key} onPress={() => console.log(data, 'CLICKED')}>
                        <LinearGradient
                            style={{
                                width: blockSize,
                                height: blockSize,
                                margin: 2,
                                borderRadius: 8,
                            }}
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
                        <View className='px-5 py-2.5'>
                            <Text
                                style={{ fontFamily: 'Suprapower' }}
                                className='text-base text-gray-900'
                            >
                                Transactions on {selectedDate}
                            </Text>
                        </View>
                    }
                    sheetKey={'statsDailyTransactionBreakdownList'}
                    data={transactionData}
                    renderItem={renderItem}
                    containerStyle={{
                        paddingHorizontal: 20,
                    }}
                    handleIndicatorStyle={{
                        backgroundColor: '#D4D4D4',
                    }}
                    flatListContentContainerStyle={{
                        paddingBottom: 100,
                        paddingHorizontal: 20,
                        backgroundColor: 'white',
                    }}
                    itemSeparator={itemSeparator}
                />
            </Portal>
            <View className='flex flex-col'>
                <View className='flex flex-row justify-between'>
                    {days.map((day, key) => (
                        <View key={key} className='flex-1 items-center'>
                            <Text
                                className='text-black text-base'
                                style={{
                                    fontFamily: 'InterSemiBold',
                                }}
                            >
                                {day}
                            </Text>
                        </View>
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
            </View>
        </>
    );
}

function arePropsEqual(prevProps: any, nextProps: any) {
    return deepCompare(prevProps, nextProps);
}

export default memo(StatsHeatmap, arePropsEqual);
