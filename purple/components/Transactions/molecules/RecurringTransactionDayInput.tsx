import React from 'react';
import { Controller, Control, FieldErrors, FieldValues } from 'react-hook-form';
import { InputField, Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';

type RecurringTransactionDayInputProps<T extends FieldValues> = {
    control: Control<T>;
    errors: FieldErrors<T>;
    name: keyof T;
    label?: string;
};

export default function RecurringTransactionDayInput<T extends FieldValues>({
    control,
    errors,
    name,
    label = 'Day',
}: RecurringTransactionDayInputProps<T>) {
    return (
        <View className='flex flex-col space-y-1'>
            <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
                {label}
            </Text>
            <Controller
                control={control}
                name={name as any}
                rules={{ required: `${label} is required` }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <InputField
                        className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12'
                        style={satoshiFont.satoshiMedium}
                        cursorColor={'#8B5CF6'}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value as any}
                        keyboardType='numeric'
                    />
                )}
            />
            {errors[name] && (
                <Text style={satoshiFont.satoshiMedium} className='text-xs text-red-500'>
                    {errors[name]?.message as string}
                </Text>
            )}
        </View>
    );
}
