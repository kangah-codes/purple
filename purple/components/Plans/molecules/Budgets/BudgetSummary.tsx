import React from 'react';
import { View, Text, TouchableOpacity } from '@/components/Shared/styled';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { satoshiFont } from '@/lib/constants/fonts';

export default function BudgetSummary() {
    return (
        <View className='px-5 py-5'>
            {/* Summary Section */}
            <View className='mb-6'>
                <View className='flex-row justify-between items-center mb-4'>
                    <Text
                        className='text-lg text-gray-900 font-bold'
                        style={satoshiFont.satoshiBold}
                    >
                        Summary
                    </Text>
                    <TouchableOpacity>
                        <Text className='text-xl text-gray-500 font-semibold'>⋯</Text>
                    </TouchableOpacity>
                </View>

                {/* Income */}
                <View className='bg-gray-50 p-4 rounded-lg'>
                    <View className='mb-2'>
                        <Text
                            className='text-base text-gray-900 font-semibold mb-1'
                            style={satoshiFont.satoshiMedium}
                        >
                            Income
                        </Text>
                        <Text className='text-sm text-gray-500' style={satoshiFont.satoshiRegular}>
                            {formatCurrencyRounded(100, 'GHS')} budget
                        </Text>
                    </View>

                    <View className='flex-row justify-between'>
                        <Text
                            className='text-sm text-gray-900 font-semibold'
                            style={satoshiFont.satoshiMedium}
                        >
                            {formatCurrencyRounded(100, 'GHS')} earned
                        </Text>
                        <Text className='text-sm text-gray-500' style={satoshiFont.satoshiRegular}>
                            {formatCurrencyRounded(100, 'GHS')} remaining
                        </Text>
                    </View>
                </View>

                {/* Expenses */}
                <View className='bg-gray-50 p-4 rounded-lg mt-4'>
                    <View className='mb-2'>
                        <Text
                            className='text-base text-gray-900 font-semibold mb-1'
                            style={satoshiFont.satoshiMedium}
                        >
                            Expenses
                        </Text>
                        <Text className='text-sm text-gray-500' style={satoshiFont.satoshiRegular}>
                            {formatCurrencyRounded(100, 'GHS')} budget
                        </Text>
                    </View>

                    <View className='flex-row justify-between'>
                        <Text
                            className='text-sm text-gray-900 font-semibold'
                            style={satoshiFont.satoshiMedium}
                        >
                            {formatCurrencyRounded(100, 'GHS')} spent
                        </Text>
                        <Text className='text-sm text-gray-500' style={satoshiFont.satoshiRegular}>
                            {formatCurrencyRounded(100, 'GHS')} remaining
                        </Text>
                    </View>
                </View>
            </View>

            {/* Expenses Breakdown */}
            <View className=''>
                <View className='flex-row justify-between items-center mb-4 px-1'>
                    <Text
                        className='text-lg text-gray-900 font-bold'
                        style={satoshiFont.satoshiBold}
                    >
                        Expenses
                    </Text>

                    <View className='flex-row'>
                        <Text
                            className='text-sm text-gray-500 ml-8'
                            style={satoshiFont.satoshiMedium}
                        >
                            Budget
                        </Text>
                        <Text
                            className='text-sm text-gray-500 ml-8'
                            style={satoshiFont.satoshiMedium}
                        >
                            Remaining
                        </Text>
                    </View>
                </View>

                {/* Fixed Expenses */}
                <TouchableOpacity className='flex-row justify-between items-center py-4 px-1'>
                    <View className='flex-row items-center flex-1'>
                        <Text className='text-xs text-gray-500 mr-3'>▼</Text>
                        <Text
                            className='text-base text-gray-900 font-semibold'
                            style={satoshiFont.satoshiMedium}
                        >
                            Fixed
                        </Text>
                    </View>

                    <View className='flex-row items-center'>
                        <Text
                            className='text-base text-gray-900 font-semibold w-20 text-right mr-8'
                            style={satoshiFont.satoshiMedium}
                        >
                            {formatCurrencyRounded(100, 'GHS')}
                        </Text>
                        <Text
                            className='text-base text-gray-500 w-20 text-right'
                            style={satoshiFont.satoshiRegular}
                        >
                            {formatCurrencyRounded(100, 'GHS')}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View className='pl-7 mt-2'>
                    <Text className='text-sm text-gray-500' style={satoshiFont.satoshiRegular}>
                        👁 Show 21 unbudgeted
                    </Text>
                </View>

                {/* Flexible Expenses */}
                <TouchableOpacity className='flex-row justify-between items-center py-4 px-1 mt-4'>
                    <View className='flex-row items-center flex-1'>
                        <Text className='text-xs text-gray-500 mr-3'>▼</Text>
                        <Text
                            className='text-base text-gray-900 font-semibold'
                            style={satoshiFont.satoshiMedium}
                        >
                            Flexible
                        </Text>
                    </View>

                    <View className='flex-row items-center'>
                        <Text
                            className='text-base text-gray-900 font-semibold w-20 text-right mr-8'
                            style={satoshiFont.satoshiMedium}
                        >
                            {formatCurrencyRounded(100, 'GHS')}
                        </Text>
                        <Text
                            className='text-base text-gray-500 w-20 text-right'
                            style={satoshiFont.satoshiRegular}
                        >
                            {formatCurrencyRounded(100, 'GHS')}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View className='pl-7 mt-2'>
                    <Text className='text-sm text-gray-500' style={satoshiFont.satoshiRegular}>
                        👁 Show 20 unbudgeted
                    </Text>
                </View>
            </View>
        </View>
    );
}
