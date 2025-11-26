import React from 'react';
import { View, Text, TouchableOpacity } from '@/components/Shared/styled';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { satoshiFont } from '@/lib/constants/fonts';

export default function BudgetSummary() {
    return (
        <View className='px-5 py-5'>
            {/* Summary Section */}
            <View className='mb-6 bg-purple-50 p-5 rounded-3xl border border-purple-100 flex flex-col space-y-2.5'>
                <View className='flex-row justify-between items-center'>
                    <Text className='text-base text-black' style={satoshiFont.satoshiBlack}>
                        Summary
                    </Text>
                    <TouchableOpacity>
                        <Text className='text-xl text-purple-500'>⋯</Text>
                    </TouchableOpacity>
                </View>

                <View className='h-[0.5px] border-b border-purple-100 w-full' />

                {/* Income */}
                <View className='flex flex-col space-y-2'>
                    <View className='flex flex-row justify-between'>
                        <Text className='text-base text-black mb-1' style={satoshiFont.satoshiBold}>
                            Income
                        </Text>
                        <Text className='text-sm text-purple-500' style={satoshiFont.satoshiBold}>
                            {formatCurrencyRounded(100, 'GHS')} budget
                        </Text>
                    </View>

                    <View className='flex flex-row items-center space-x-0.5'>
                        <View
                            className='h-2 bg-purple-600 rounded-md'
                            style={{
                                width: `${Math.min(23, 100)}%`,
                            }}
                        />
                        <View className='h-2 flex-grow bg-purple-200 rounded-md' />
                    </View>

                    <View className='flex-row justify-between'>
                        <Text className='text-sm text-black' style={satoshiFont.satoshiBold}>
                            {formatCurrencyRounded(100, 'GHS')} earned
                        </Text>
                        <Text className='text-sm text-purple-500' style={satoshiFont.satoshiBold}>
                            {formatCurrencyRounded(100, 'GHS')} remaining
                        </Text>
                    </View>
                </View>

                <View className='py-2.5'>
                    <View className='h-[0.5px] border-b border-purple-100 w-full' />
                </View>

                {/* Expenses */}
                <View className='flex flex-col space-y-2'>
                    <View className='flex flex-row justify-between'>
                        <Text className='text-base text-black mb-1' style={satoshiFont.satoshiBold}>
                            Expenses
                        </Text>
                        <Text className='text-sm text-purple-500' style={satoshiFont.satoshiBold}>
                            {formatCurrencyRounded(100, 'GHS')} budget
                        </Text>
                    </View>

                    <View className='flex flex-row items-center space-x-0.5'>
                        <View
                            className='h-2 bg-purple-600 rounded-md'
                            style={{
                                width: `${Math.min(78, 100)}%`,
                            }}
                        />
                        <View className='h-2 flex-grow bg-purple-200 rounded-md' />
                    </View>

                    <View className='flex-row justify-between'>
                        <Text className='text-sm text-black' style={satoshiFont.satoshiBold}>
                            {formatCurrencyRounded(100, 'GHS')} earned
                        </Text>
                        <Text className='text-sm text-purple-500' style={satoshiFont.satoshiBold}>
                            {formatCurrencyRounded(100, 'GHS')} remaining
                        </Text>
                    </View>
                </View>
            </View>

            {/* Expenses Breakdown */}
            <View className='flex flex-col space-y-5'>
                <View className='flex-row justify-between items-center px-5'>
                    <Text
                        className='text-base text-black font-bold'
                        style={satoshiFont.satoshiBold}
                    >
                        Expenses
                    </Text>

                    <View className='flex-row'>
                        <Text
                            className='text-sm text-purple-500 ml-8'
                            style={satoshiFont.satoshiBold}
                        >
                            Budget
                        </Text>
                        <Text
                            className='text-sm text-purple-500 ml-8'
                            style={satoshiFont.satoshiBold}
                        >
                            Remaining
                        </Text>
                    </View>
                </View>

                {/* Fixed Expenses */}
                <View className='flex flex-col space-y-2.5 bg-purple-50 rounded-3xl border border-purple-100 p-5'>
                    <View className='flex-row justify-between items-center'>
                        <View className='flex-row items-center flex-1'>
                            <Text className='text-sm text-black' style={satoshiFont.satoshiBold}>
                                Fixed
                            </Text>
                        </View>

                        <View className='flex-row items-center'>
                            <Text
                                className='text-sm text-black w-20 text-right mr-8'
                                style={satoshiFont.satoshiBold}
                            >
                                {formatCurrencyRounded(100, 'GHS')}
                            </Text>
                            <Text
                                className='text-sm text-purple-500 w-20 text-right'
                                style={satoshiFont.satoshiBold}
                            >
                                {formatCurrencyRounded(100, 'GHS')}
                            </Text>
                        </View>
                    </View>
                    <View className='h-[1px] border-b border-purple-100 w-full' />
                    <View>
                        {new Array(3).fill(null).map((_, idx) => (
                            <View key={idx} className='flex-row justify-between items-center'>
                                <View className='flex-row items-center flex-1'>
                                    <Text
                                        className='text-sm text-black'
                                        style={satoshiFont.satoshiBold}
                                    >
                                        Expense {idx + 1}
                                    </Text>
                                </View>

                                <View className='flex-row items-center'>
                                    <Text
                                        className='text-sm text-black w-20 text-right mr-8'
                                        style={satoshiFont.satoshiBold}
                                    >
                                        {formatCurrencyRounded(100, 'GHS')}
                                    </Text>
                                    <Text
                                        className='text-sm text-purple-500 w-20 text-right'
                                        style={satoshiFont.satoshiBold}
                                    >
                                        {formatCurrencyRounded(100, 'GHS')}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View className='flex flex-col space-y-2.5 bg-purple-50 rounded-3xl border border-purple-100 p-5'>
                    <View className='flex-row justify-between items-center'>
                        <View className='flex-row items-center flex-1'>
                            <Text className='text-sm text-black' style={satoshiFont.satoshiBold}>
                                Fixed
                            </Text>
                        </View>

                        <View className='flex-row items-center'>
                            <Text
                                className='text-sm text-black w-20 text-right mr-8'
                                style={satoshiFont.satoshiBold}
                            >
                                {formatCurrencyRounded(100, 'GHS')}
                            </Text>
                            <Text
                                className='text-sm text-purple-500 w-20 text-right'
                                style={satoshiFont.satoshiBold}
                            >
                                {formatCurrencyRounded(100, 'GHS')}
                            </Text>
                        </View>
                    </View>
                    <View className='h-[1px] border-b border-purple-100 w-full' />
                    <View>
                        {new Array(3).fill(null).map((_, idx) => (
                            <View key={idx} className='flex-row justify-between items-center'>
                                <View className='flex-row items-center flex-1'>
                                    <Text
                                        className='text-sm text-black'
                                        style={satoshiFont.satoshiBold}
                                    >
                                        Expense {idx + 1}
                                    </Text>
                                </View>

                                <View className='flex-row items-center'>
                                    <Text
                                        className='text-sm text-black w-20 text-right mr-8'
                                        style={satoshiFont.satoshiBold}
                                    >
                                        {formatCurrencyRounded(100, 'GHS')}
                                    </Text>
                                    <Text
                                        className='text-sm text-purple-500 w-20 text-right'
                                        style={satoshiFont.satoshiBold}
                                    >
                                        {formatCurrencyRounded(100, 'GHS')}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </View>
    );
}
