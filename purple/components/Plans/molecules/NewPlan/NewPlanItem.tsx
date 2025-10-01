import { InputField, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { TrashIcon } from '@/components/SVG/icons/24x24';
import { satoshiFont } from '@/lib/constants/fonts';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import React from 'react';

export default function NewPlanItem({ category, emoji }: { category: string; emoji: string }) {
    return (
        <View className='flex flex-row items-center justify-between space-x-2.5'>
            <TouchableOpacity className='flex flex-row items-center space-x-3'>
                <View className='relative items-center justify-center flex rounded-xl h-10 w-10 bg-purple-100'>
                    <Text className='absolute text-base'>{emoji}</Text>
                </View>
            </TouchableOpacity>
            <View className='flex flex-col'>
                <Text className='text-sm' style={satoshiFont.satoshiBold}>
                    {truncateStringIfLongerThan(category, 15)}
                </Text>
                <Text className='text-xs text-purple-500' style={satoshiFont.satoshiBold}>
                    32%
                </Text>
            </View>
            <InputField
                className='bg-purple-50/80 rounded-full px-4 border w-[40%] text-xs h-12 flex-1'
                style={satoshiFont.satoshiMedium}
                cursorColor={'#8B5CF6'}
                placeholder='Amount'
                keyboardType='numeric'
                // onChangeText={onChange}
                // onBlur={onBlur}
                // value={value}
            />
            <TouchableOpacity
                onPress={alert}
                className='relative items-center justify-center flex rounded-full h-12 w-12 bg-red-100'
            >
                <TrashIcon stroke='#EF4444' width={20} />
            </TouchableOpacity>
        </View>
    );
}
