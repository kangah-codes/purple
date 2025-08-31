import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { CalendarIcon } from '@/components/SVG/icons/16x16';
import { satoshiFont } from '@/lib/constants/fonts';
import React, { useState } from 'react';
import MonthPicker, { MonthPickerProps } from 'react-native-month-year-picker';

export default function StatsNavigationArea() {
    const [value, setValue] = useState<Date>(new Date());
    const [show, setShow] = useState(false);

    const handleCalendarOpen = () => {
        setShow(true);
    };

    const handleChange: MonthPickerProps['onChange'] = (_, newDate) => {
        setShow(() => {
            setValue(newDate);
            return false;
        });
    };

    console.log(value);

    return (
        <View className='w-full flex flex-row py-2.5 justify-end items-center relative px-5'>
            <View className='absolute left-0 right-0 items-center'>
                <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                    Reports
                </Text>
            </View>

            <TouchableOpacity
                onPress={handleCalendarOpen}
                className='bg-purple-50 px-5 h-10 flex items-center justify-center rounded-full'
            >
                <CalendarIcon stroke='#9333EA' strokeWidth={1.5} width={20} height={20} />
            </TouchableOpacity>

            {show && (
                <MonthPicker
                    onChange={handleChange}
                    value={value}
                    minimumDate={new Date(2000, 0)}
                    maximumDate={new Date(2026, 0)}
                />
            )}
        </View>
    );
}
