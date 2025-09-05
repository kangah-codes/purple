import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { CalendarIcon } from '@/components/SVG/icons/16x16';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/SVG/icons/24x24';
import { satoshiFont } from '@/lib/constants/fonts';
import { format } from 'date-fns';
import React, { useState } from 'react';
import MonthPicker, { MonthPickerProps } from 'react-native-month-year-picker';

type StatsNavigationAreaProps = {
    currentMonthIndex: number;
    setCurrentMonthIndex: React.Dispatch<React.SetStateAction<number>>;
    currentDate: Date;
    setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
    availableMonths: Date[];
    goToPreviousMonth: () => void;
    goToNextMonth: () => void;
};

export default function StatsNavigationArea({
    currentMonthIndex,
    setCurrentMonthIndex,
    currentDate,
    setCurrentDate,
    availableMonths,
    goToNextMonth,
    goToPreviousMonth,
}: StatsNavigationAreaProps) {
    return (
        <View className='w-full flex flex-row my-2.5 justify-between items-center relative px-5'>
            <TouchableOpacity
                className={`px-4 py-2 flex items-center justify-center rounded-full ${
                    currentMonthIndex <= 0 // Changed condition
                        ? 'bg-gray-100'
                        : 'bg-purple-50'
                }`}
                onPress={goToPreviousMonth}
                disabled={currentMonthIndex <= 0}
            >
                <ArrowLeftIcon
                    stroke={currentMonthIndex <= 0 ? '#9CA3AF' : '#9333EA'} // Changed condition
                    strokeWidth={2.5}
                />
            </TouchableOpacity>

            <View className='absolute left-0 right-0 items-center'>
                <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                    {format(currentDate, 'MMM yyyy')} Report
                </Text>
            </View>

            <TouchableOpacity
                className={`px-4 py-2 flex items-center justify-center rounded-full ${
                    currentMonthIndex >= availableMonths.length - 1 // Changed condition
                        ? 'bg-gray-100'
                        : 'bg-purple-50'
                }`}
                onPress={goToNextMonth}
                disabled={currentMonthIndex >= availableMonths.length - 1} // Changed condition
            >
                <ArrowRightIcon
                    stroke={currentMonthIndex >= availableMonths.length - 1 ? '#9CA3AF' : '#9333EA'} // Changed condition
                    strokeWidth={2.5}
                />
            </TouchableOpacity>
        </View>
    );
}
