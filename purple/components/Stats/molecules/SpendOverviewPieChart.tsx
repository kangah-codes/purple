import { Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { formatCurrencyRounded } from '@/lib/utils/number';
import React from 'react';
import { PieChart } from 'react-native-gifted-charts';

type SpendOverviewPieChartProps = {
    currency: string;
    data: { name: string; value: number; color: string }[];
};

export default function SpendOverviewPieChart({ currency, data }: SpendOverviewPieChartProps) {
    return (
        <View
            key={currency}
            className='flex items-center justify-between flex-row space-x-5 h-[160] mt-5'
        >
            <PieChart
                donut
                radius={80}
                innerRadius={60}
                data={data.map((item) => ({
                    value: item.value,
                    color: item.color,
                }))}
                showGradient
            />

            <View className='flex flex-col flex-grow rounded-lg h-full space-y-2.5 items-center justify-center'>
                {data.map((item) => (
                    <View key={item.name} className='flex flex-col'>
                        <View className='flex flex-row items-center space-x-1.5 justify-center'>
                            <View
                                className={`w-2.5 h-2.5 rounded-full`}
                                style={{ backgroundColor: item.color }}
                            />
                            <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-sm'>
                                {item.name}
                            </Text>
                        </View>
                        <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-lg'>
                            {formatCurrencyRounded(item.value, currency)}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
