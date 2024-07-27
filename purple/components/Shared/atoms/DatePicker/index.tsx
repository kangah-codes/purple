import { CalendarIcon } from '@/components/SVG/16x16';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import DateTimePicker, {
    DateTimePickerAndroid,
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform } from 'react-native';
import CustomBottomSheetModal from '../../molecules/GlobalBottomSheetModal';
import { useBottomSheetModalStore } from '../../molecules/GlobalBottomSheetModal/hooks';

type DatePickerProps = {
    label?: string;
    onChange?: (date: Date) => void;
    pickerKey: string;
    minimumDate?: Date;
    maximumDate?: Date;
};

export default function DatePicker({
    label,
    onChange,
    pickerKey,
    minimumDate,
    maximumDate,
}: DatePickerProps) {
    const [date, setDate] = useState(new Date());
    const { setShowBottomSheetModal } = useBottomSheetModalStore();

    const onDateChange = (_event: DateTimePickerEvent, selectedDate: Date | undefined) => {
        const currentDate = selectedDate;
        if (currentDate) setDate(currentDate);

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
                        snapPoints={['35%', '35%']}
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
                        <View className='flex flex-col'>
                            {label && (
                                <View className='px-5 py-1'>
                                    <Text
                                        style={{ fontFamily: 'Suprapower' }}
                                        className='text-base text-gray-900'
                                    >
                                        {label}
                                    </Text>
                                </View>
                            )}
                            <DateTimePicker
                                testID='dateTimePicker'
                                value={date}
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
                    <Text style={{ fontFamily: 'InterBold' }} className='text-xs text-gray-500'>
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
                                value: date,
                                onChange: onDateChange,
                                mode: 'date',
                                is24Hour: true,
                                minimumDate,
                                maximumDate,
                            });
                        }
                    }}
                    className='flex flex-row items-center space-x-2 bg-gray-100 rounded-lg px-2 text-sm border border-gray-200 h-12 relative'
                >
                    <View className='absolute right-4'>
                        <CalendarIcon stroke={'#8B5CF6'} />
                    </View>

                    <Text style={{ fontFamily: 'InterSemiBold' }} className='text-xs text-gray-900'>
                        {date.toDateString()}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );
}
