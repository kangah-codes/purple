import { CalendarIcon } from '@/components/SVG/icons/16x16';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import DateTimePicker, {
    DateTimePickerAndroid,
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import CustomBottomSheetModal from '../../molecules/GlobalBottomSheetModal';
import { useBottomSheetModalStore } from '../../molecules/GlobalBottomSheetModal/hooks';

const snapPoints = ['35%', '35%'];

type DatePickerProps = {
    label?: string;
    onChange?: (date: Date) => void;
    pickerKey: string;
    minimumDate?: Date;
    maximumDate?: Date;
    value: Date;
};

export default function DatePicker({
    label,
    onChange,
    pickerKey,
    minimumDate,
    maximumDate,
    value,
}: DatePickerProps) {
    const { setShowBottomSheetModal } = useBottomSheetModalStore();
    // const [selectedDate, setSelectedDate] = useState<Date>(value);

    const onDateChange = (_event: DateTimePickerEvent, pickedDate: Date | undefined) => {
        if (!pickedDate) return;

        DateTimePickerAndroid.open({
            value: pickedDate,
            onChange: (event, selectedTime) => onTimeChange(pickedDate, event, selectedTime),
            mode: 'time',
            is24Hour: true,
        });
    };

    const onTimeChange = (
        pickedDate: Date,
        _event: DateTimePickerEvent,
        pickedTime: Date | undefined,
    ) => {
        if (!pickedTime) return;

        const combinedDateTime = new Date(pickedDate);
        combinedDateTime.setHours(pickedTime.getHours());
        combinedDateTime.setMinutes(pickedTime.getMinutes());
        combinedDateTime.setSeconds(pickedTime.getSeconds());
        combinedDateTime.setMilliseconds(0);

        if (typeof onChange === 'function') {
            onChange(combinedDateTime);
        }
    };

    const onIOSDateTimeChange = (
        _event: DateTimePickerEvent,
        selectedDateTime: Date | undefined,
    ) => {
        if (!selectedDateTime) return;

        if (typeof onChange === 'function') {
            onChange(selectedDateTime);
        }
    };

    const formatDateTime = (date: Date) => {
        return `${date.toDateString()} ${date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        })}`;
    };

    return (
        <>
            {
                // render bottom sheet modal for ios only
                Platform.OS === 'ios' && (
                    <CustomBottomSheetModal
                        modalKey={pickerKey}
                        snapPoints={snapPoints}
                        style={styles.bottomSheet}
                        handleIndicatorStyle={{
                            backgroundColor: '#D4D4D4',
                        }}
                    >
                        <View className='flex flex-col'>
                            {label && (
                                <View className='px-5 py-1'>
                                    <Text
                                        style={satoshiFont.satoshiBold}
                                        className='text-base text-gray-900'
                                    >
                                        {label}
                                    </Text>
                                </View>
                            )}
                            <DateTimePicker
                                testID='dateTimePicker'
                                value={value}
                                mode={'datetime'}
                                onChange={onIOSDateTimeChange}
                                display='spinner'
                                minimumDate={minimumDate}
                                maximumDate={maximumDate}
                            />
                        </View>
                    </CustomBottomSheetModal>
                )
            }
            <View className='flex flex-col space-y-1'>
                {label && (
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
                        {label}
                    </Text>
                )}
                <TouchableOpacity
                    onPress={() => {
                        if (Platform.OS === 'ios') {
                            setShowBottomSheetModal(pickerKey, true);
                        } else {
                            DateTimePickerAndroid.open({
                                value,
                                onChange: onDateChange,
                                mode: 'date',
                                is24Hour: true,
                                minimumDate,
                                maximumDate,
                            });
                        }
                    }}
                    className='flex flex-row items-center space-x-2 bg-purple-50/80 rounded-full px-2 text-sm border border-purple-200 h-12 relative'
                >
                    <View className='absolute right-4'>
                        <CalendarIcon stroke={'#8B5CF6'} />
                    </View>

                    <Text style={satoshiFont.satoshiMedium} className='text-xs text-gray-900'>
                        {formatDateTime(value)}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    bottomSheet: {
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
    },
});
