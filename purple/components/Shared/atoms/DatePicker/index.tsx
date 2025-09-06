import { CalendarIcon } from '@/components/SVG/icons/16x16';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import DateTimePicker, {
    DateTimePickerAndroid,
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React from 'react';
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
    value?: Date | string | null;
    placeholder?: string;
};

export default function DatePicker({
    label,
    onChange,
    pickerKey,
    minimumDate,
    maximumDate,
    value,
    placeholder = 'Select a date',
}: DatePickerProps) {
    const { setShowBottomSheetModal } = useBottomSheetModalStore();
    const getDateValue = (): Date => {
        if (!value || value === '') {
            return new Date();
        }
        if (typeof value === 'string') {
            const parsed = new Date(value);
            return isNaN(parsed.getTime()) ? new Date() : parsed;
        }
        return value;
    };
    const dateValue = getDateValue();
    const handleDateChange = (_event: DateTimePickerEvent, pickedDate?: Date) => {
        if (!pickedDate) return;
        if (typeof onChange === 'function') {
            onChange(pickedDate);
        }
    };
    const formatDate = (date?: Date | string | null) => {
        if (!date || date === '') return placeholder;

        let dateObj: Date;
        if (typeof date === 'string') {
            dateObj = new Date(date);
        } else {
            dateObj = date;
        }

        if (isNaN(dateObj.getTime())) return placeholder;
        return dateObj.toDateString();
    };

    return (
        <>
            {/* iOS modal */}
            {Platform.OS === 'ios' && (
                <CustomBottomSheetModal
                    modalKey={pickerKey}
                    snapPoints={snapPoints}
                    style={styles.bottomSheet}
                    handleIndicatorStyle={{ backgroundColor: '#D4D4D4' }}
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
                            testID='datePicker'
                            value={dateValue}
                            mode='date'
                            onChange={handleDateChange}
                            display='spinner'
                            minimumDate={minimumDate}
                            maximumDate={maximumDate}
                        />
                    </View>
                </CustomBottomSheetModal>
            )}

            {/* Trigger button */}
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
                                value: dateValue,
                                onChange: handleDateChange,
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
                        {formatDate(value)}
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
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 48,
        elevation: 10,
    },
});
