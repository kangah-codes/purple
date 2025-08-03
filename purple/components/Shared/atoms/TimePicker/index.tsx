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

type TimePickerProps = {
    label?: string;
    onChange?: (date: Date) => void;
    pickerKey: string;
    value: Date;
};

export default function TimePicker({ label, onChange, pickerKey, value }: TimePickerProps) {
    const { setShowBottomSheetModal } = useBottomSheetModalStore();

    const handleTimeChange = (_event: DateTimePickerEvent, pickedDate?: Date) => {
        if (!pickedDate) return;
        if (typeof onChange === 'function') {
            onChange(pickedDate);
        }
    };

    // format time like "2:30 PM"
    const formatTime = (date: Date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const normalizedHours = hours % 12 || 12;
        const paddedMinutes = minutes.toString().padStart(2, '0');
        return `${normalizedHours}:${paddedMinutes} ${ampm}`;
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
                            testID='timePicker'
                            value={value}
                            mode='time'
                            onChange={handleTimeChange}
                            display='spinner'
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
                                value,
                                onChange: handleTimeChange,
                                mode: 'time',
                                is24Hour: false,
                            });
                        }
                    }}
                    className='flex flex-row items-center space-x-2 bg-purple-50/80 rounded-full px-2 text-sm border border-purple-200 h-12 relative'
                >
                    <View className='absolute right-4'>
                        <CalendarIcon stroke={'#8B5CF6'} />
                    </View>

                    <Text style={satoshiFont.satoshiMedium} className='text-xs text-gray-900'>
                        {formatTime(value)}
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
