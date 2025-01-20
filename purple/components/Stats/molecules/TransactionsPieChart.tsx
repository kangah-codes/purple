import { PieChart } from 'react-native-gifted-charts';
import { View, Text } from '@/components/Shared/styled';
import { memo, useCallback } from 'react';
import React from 'react';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';

function TransactionsPieChart() {
    const pieData = [
        { value: 4, color: '#9333EA', gradientCenterColor: '#F3E8FF' },
        { value: 54, color: '#EF4444', gradientCenterColor: '#FEE2E2' },
        { value: 20, color: '#16A34A', gradientCenterColor: '#DCFCE7' },
    ];
    return (
        <View className='flex items-center justify-between flex-row space-x-5 h-[160] mt-5'>
            <PieChart donut radius={80} innerRadius={60} data={pieData} showGradient />

            <View className='flex flex-col flex-grow rounded-lg h-full space-y-2.5 items-center justify-center'>
                <View className='flex flex-col'>
                    <View className='flex flex-row items-center space-x-1.5'>
                        <View className='w-2.5 h-2.5 rounded-full bg-[#16A34A]' />
                        <Text style={GLOBAL_STYLESHEET.satoshiMedium} className='text-sm'>
                            Income
                        </Text>
                    </View>
                    <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-lg'>
                        3,046.09
                    </Text>
                </View>

                <View className='flex flex-col'>
                    <View className='flex flex-row items-center space-x-1.5'>
                        <View className='w-2.5 h-2.5 rounded-full bg-[#EF4444]' />
                        <Text style={GLOBAL_STYLESHEET.satoshiMedium} className='text-sm'>
                            Expenses
                        </Text>
                    </View>
                    <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-lg'>
                        3,046.09
                    </Text>
                </View>

                <View className='flex flex-col'>
                    <View className='flex flex-row items-center space-x-1.5'>
                        <View className='w-2.5 h-2.5 rounded-full bg-[#9333EA]' />
                        <Text style={GLOBAL_STYLESHEET.satoshiMedium} className='text-sm'>
                            Transfers
                        </Text>
                    </View>
                    <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-lg'>
                        3,046.09
                    </Text>
                </View>
            </View>
        </View>
    );
}

export default memo(TransactionsPieChart);
