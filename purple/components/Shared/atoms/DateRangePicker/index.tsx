import { Text, View } from '@/components/Shared/styled';
import { ChevronRightIcon } from '@/components/SVG/icons/16x16';
import { ChevronLeftIcon } from '@/components/SVG/icons/24x24';
import { satoshiFont } from '@/lib/constants/fonts';
import React, { useState, useMemo, useCallback, useEffect, memo } from 'react';
import { Calendar, DateData } from 'react-native-calendars';

const PURPLE = {
    light: '#c084fc',
    mid: '#a855f7',
    dark: '#9333ea',
};

interface DateRange {
    startDate: string | null;
    endDate: string | null;
}

interface DateRangePickerProps {
    onDateRangeChange?: (dateRange: DateRange) => void;
    initialDateRange?: DateRange;
    minDate?: string;
    maxDate?: string;
}

const currentDateString = new Date().toISOString().split('T')[0];

const DateRangePicker = (props: DateRangePickerProps) => {
    const { onDateRangeChange, initialDateRange, minDate, maxDate } = props;
    const [dateRange, setDateRange] = useState<DateRange>(
        initialDateRange || { startDate: null, endDate: null },
    );

    const marked = useMemo(() => {
        if (!dateRange.startDate && !dateRange.endDate) return {};

        const markedDates: Record<
            string,
            {
                startingDay?: boolean;
                endingDay?: boolean;
                color?: string;
                textColor?: string;
            }
        > = {};

        if (dateRange.startDate && !dateRange.endDate) {
            markedDates[dateRange.startDate] = {
                startingDay: true,
                endingDay: true,
                color: PURPLE.dark,
                textColor: 'white',
            };
        } else if (dateRange.startDate && dateRange.endDate) {
            const startTime = new Date(dateRange.startDate).getTime();
            const endTime = new Date(dateRange.endDate).getTime();
            const oneDay = 24 * 60 * 60 * 1000;

            markedDates[dateRange.startDate] = {
                startingDay: true,
                color: PURPLE.dark,
                textColor: 'white',
            };

            markedDates[dateRange.endDate] = {
                endingDay: true,
                color: PURPLE.dark,
                textColor: 'white',
            };

            for (let time = startTime + oneDay; time < endTime; time += oneDay) {
                const dateString = new Date(time).toISOString().split('T')[0];
                markedDates[dateString] = {
                    color: PURPLE.mid,
                    textColor: 'white',
                };
            }
        }

        return markedDates;
    }, [dateRange.startDate, dateRange.endDate]);

    const onDayPress = useCallback((day: DateData) => {
        const selectedDate = day.dateString;
        setDateRange((prevRange) => {
            if (!prevRange.startDate || (prevRange.startDate && prevRange.endDate)) {
                return { startDate: selectedDate, endDate: null };
            } else if (prevRange.startDate && !prevRange.endDate) {
                const startTime = new Date(prevRange.startDate).getTime();
                const endTime = new Date(selectedDate).getTime();

                if (endTime < startTime) {
                    return { startDate: selectedDate, endDate: prevRange.startDate };
                } else {
                    return { startDate: prevRange.startDate, endDate: selectedDate };
                }
            }
            return prevRange;
        });
    }, []);

    useEffect(() => {
        onDateRangeChange?.(dateRange);
    }, [dateRange.startDate, dateRange.endDate]);

    return (
        <Calendar
            current={currentDateString}
            onDayPress={onDayPress}
            markedDates={marked}
            markingType='period'
            renderHeader={renderCustomHeader}
            enableSwipeMonths={false}
            minDate={minDate}
            maxDate={maxDate}
            theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#a3a3a3',
                textSectionTitleDisabledColor: '#e5e5e5',
                selectedDayBackgroundColor: PURPLE.dark,
                selectedDayTextColor: 'white',
                todayTextColor: PURPLE.dark,
                dayTextColor: '#2d4150',
                textDisabledColor: '#e5e5e5',
                dotColor: PURPLE.dark,
                selectedDotColor: 'white',
                arrowColor: PURPLE.dark,
                disabledArrowColor: '#e5e5e5',
                monthTextColor: PURPLE.dark,
                indicatorColor: PURPLE.dark,
                textDayFontFamily: 'SatoshiBold',
                textMonthFontFamily: 'SatoshiBold',
                textDayHeaderFontFamily: 'SatoshiBold',
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 14,
            }}
            renderArrow={(direction: 'left' | 'right') =>
                direction === 'left' ? (
                    <ChevronLeftIcon strokeWidth={3} width={17} stroke={PURPLE.dark} />
                ) : (
                    <ChevronRightIcon strokeWidth={3} width={17} stroke={PURPLE.dark} />
                )
            }
        />
    );
};

function renderCustomHeader(date: { toString: (format: string) => string }) {
    const header = date.toString('MMMM yyyy');
    const [month, year] = header.split(' ');

    return (
        <View className='flex flex-row justify-center items-center space-x-1'>
            <Text style={[satoshiFont.satoshiBold]} className='text-base text-purple-600'>
                {month} {year}
            </Text>
        </View>
    );
}

export default memo(DateRangePicker);
