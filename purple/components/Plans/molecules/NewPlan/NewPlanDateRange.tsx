import DateRangePicker from '@/components/Shared/atoms/DateRangePicker';
import GlobalBottomSheetModal from '@/components/Shared/molecules/GlobalBottomSheetModal';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import { StoriesRef } from '@/components/Shared/molecules/Stories';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { ArrowRightIcon } from '@/components/SVG/icons/24x24';
import { satoshiFont } from '@/lib/constants/fonts';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { format } from 'date-fns';
import React, { memo, useCallback, useEffect } from 'react';

interface DateRange {
    startDate: string | null;
    endDate: string | null;
}

type NewPlanDateRange = {
    storiesRef: React.RefObject<StoriesRef>;
};

function NewPlanDateRange({ storiesRef }: NewPlanDateRange) {
    const { setShowBottomSheetModal } = useBottomSheetModalStore();
    const [selectedDateRange, setSelectedDateRange] = React.useState<DateRange>({
        startDate: null,
        endDate: null,
    });

    const handleDateRangeChange = useCallback((dateRange: DateRange) => {
        setSelectedDateRange(dateRange);
    }, []);

    useEffect(() => {
        if (selectedDateRange.startDate && selectedDateRange.endDate) {
            // add a small delay
            const timeout = setTimeout(() => {
                setShowBottomSheetModal('newPlanDateRange', false);
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [selectedDateRange.startDate, selectedDateRange.endDate, setShowBottomSheetModal]);

    const formatDateRange = React.useMemo(() => {
        if (!selectedDateRange.startDate && !selectedDateRange.endDate) {
            return 'Select period';
        }

        if (selectedDateRange.startDate && !selectedDateRange.endDate) {
            return format(new Date(selectedDateRange.startDate), 'd MMM');
        }

        if (selectedDateRange.startDate && selectedDateRange.endDate) {
            return `${format(new Date(selectedDateRange.startDate), 'd MMM')} - ${format(
                new Date(selectedDateRange.endDate),
                'd MMM',
            )}`;
        }

        return 'Select period';
    }, [selectedDateRange.startDate, selectedDateRange.endDate]);

    return (
        // <View style={styles.linearContainer}>
        // <Calendar
        //     calendarActiveDateRanges={calendarActiveDateRanges}
        //     calendarDayHeight={30}
        //     calendarFirstDayOfWeek='sunday'
        //     calendarMonthId={toDateId(startOfThisMonth)}
        //     calendarRowHorizontalSpacing={16}
        //     calendarRowVerticalSpacing={16}
        //     getCalendarWeekDayFormat={format('iiiiii')}
        //     onCalendarDayPress={loggingHandler('onCalendarDayPress')}
        //     theme={linearTheme}
        // />
        // </View>
        <>
            <View className='flex flex-col space-y-5 justify-center h-[100%] relative px-5'>
                <View className='flex flex-col space-y-2.5'>
                    <Text style={satoshiFont.satoshiBold} className='text-base text-purple-500'>
                        How long should this budget last?
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => setShowBottomSheetModal('newPlanDateRange', true)}
                    className='flex flex-row justify-between items-center'
                >
                    {/* <Calendar.List
                    calendarActiveDateRanges={calendarActiveDateRanges}
                    onCalendarDayPress={onCalendarDayPress}
                    /> */}
                    <Text style={satoshiFont.satoshiBlack} className='text-4xl text-black'>
                        {formatDateRange}
                    </Text>
                </TouchableOpacity>

                <View className='absolute bottom-8 left-5 right-5 flex-row justify-between items-center'>
                    <TouchableOpacity
                        onPress={() => {
                            storiesRef?.current?.goToPage(storiesRef.current.currentIndex - 1);
                        }}
                    >
                        <Text style={satoshiFont.satoshiBlack} className='text-sm text-purple-500'>
                            Back
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() =>
                            storiesRef?.current?.goToPage(storiesRef.current.currentIndex + 1)
                        }
                        className='bg-purple-300 px-4 py-2.5 w-[75px] flex items-center justify-center rounded-full'
                    >
                        <ArrowRightIcon stroke='#9810fa' strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
            </View>
            <GlobalBottomSheetModal
                modalKey={'newPlanDateRange'}
                snapPoints={['50%', '50%']}
                style={{
                    backgroundColor: 'white',
                    borderRadius: 24,
                    shadowColor: '#000000',
                    shadowOffset: {
                        width: 0,
                        height: 8,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 48,
                    elevation: 10,
                }}
                handleIndicatorStyle={{
                    backgroundColor: '#D4D4D4',
                }}
            >
                <BottomSheetScrollView showsVerticalScrollIndicator={false}>
                    <DateRangePicker
                        onDateRangeChange={handleDateRangeChange}
                        initialDateRange={selectedDateRange}
                    />
                </BottomSheetScrollView>
            </GlobalBottomSheetModal>
        </>
    );
}

export default memo(NewPlanDateRange);
