import { CalendarIcon } from '@/components/SVG/16x16';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import DateTimePicker, {
    DateTimePickerAndroid,
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import CustomBottomSheetModal from '../../molecules/GlobalBottomSheetModal';
import { useBottomSheetModalStore } from '../../molecules/GlobalBottomSheetModal/hooks';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import React from 'react';

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

    const onDateChange = (_event: DateTimePickerEvent, selectedDate: Date | undefined) => {
        const currentDate = selectedDate;

        // call the callback function if it exists
        if (currentDate && typeof onChange === 'function') onChange(currentDate);
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
                                        style={GLOBAL_STYLESHEET.satoshiBold}
                                        className='text-base text-gray-900'
                                    >
                                        {label}
                                    </Text>
                                </View>
                            )}
                            <DateTimePicker
                                testID='dateTimePicker'
                                value={value}
                                mode={'date'}
                                is24Hour={true}
                                onChange={onDateChange}
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
                    <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-xs text-gray-600'>
                        {label}
                    </Text>
                )}
                <TouchableOpacity
                    onPress={() => {
                        if (Platform.OS === 'ios') {
                            setShowBottomSheetModal(pickerKey, true);
                        } else {
                            // use imperative api for android since it's better
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

                    <Text style={GLOBAL_STYLESHEET.satoshiMedium} className='text-xs text-gray-900'>
                        {value.toDateString()}
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
