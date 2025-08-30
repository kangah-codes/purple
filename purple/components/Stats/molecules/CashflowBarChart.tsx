import { Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import React, { useCallback, useMemo, useState } from 'react';
import { BarChart } from 'react-native-gifted-charts';

export default function CashflowBarChart() {
    const [width, setWidth] = useState(0);
    const [chartW, setChartW] = useState(0);

    // Build stackData: each day has 2 segments (green for +, red for -)
    const rawData = [
        { label: 'Mon', inflow: 15, outflow: -5 },
        { label: 'Tue', inflow: 30, outflow: -12 },
        { label: 'Wed', inflow: 10, outflow: -23 },
        { label: 'Thu', inflow: 40, outflow: -8 },
        { label: 'Fri', inflow: 5, outflow: -16 },
        { label: 'Sat', inflow: 21, outflow: -23 },
        { label: 'Sun', inflow: 21, outflow: -23 },
    ];

    const stackData = rawData.map((item) => ({
        label: item.label,
        stacks: [
            ...(item.outflow ? [{ value: item.outflow, color: '#EF4444' }] : []),
            ...(item.inflow ? [{ value: item.inflow, color: '#22C55E' }] : []),
        ],
    }));

    const renderYAxisLabel = useCallback((label: string) => {
        const labelVal = Number(label);
        if (labelVal >= 1000000) return (labelVal / 1000000).toFixed(0) + 'M';
        if (labelVal >= 1000) return (labelVal / 1000).toFixed(0) + 'K';
        return label;
    }, []);

    const { barWidth, spacing } = useMemo(() => {
        const n = stackData.length || 1;
        const minSpacing = 8;
        if (chartW <= 0) return { barWidth: 0, spacing: 0 };

        const yAxisLabelWidth = 40; // reserve space for y-axis labels
        const availableW = chartW - yAxisLabelWidth;

        const bw = Math.max(2, Math.floor((availableW - (n - 1) * minSpacing) / n));
        const sp = n > 1 ? Math.max(0, Math.floor((availableW - n * bw) / (n - 1))) : 0;

        return { barWidth: bw, spacing: sp };
    }, [chartW, stackData.length]);

    return (
        <View className='px-5 pt-5 pb-2.5 mb-5 bg-purple-50 border-[0.5px] border-purple-100 rounded-3xl'>
            <View className='mb-2.5'>
                <Text className='text-base text-black' style={satoshiFont.satoshiBlack}>
                    Monthly Spend
                </Text>
                <View className='flex flex-row space-x-2'>
                    <View className='flex flex-row items-center space-x-1'>
                        <View className='w-1.5 h-1.5 rounded-full bg-purple-500' />
                        <Text className='text-purple-500 text-xs' style={satoshiFont.satoshiBold}>
                            This month
                        </Text>
                    </View>
                    <View className='flex flex-row items-center space-x-1'>
                        <View className='w-1.5 h-1.5 rounded-full bg-[#737373]' />
                        <Text className='text-[#737373] text-xs' style={satoshiFont.satoshiBold}>
                            Last month
                        </Text>
                    </View>
                </View>
            </View>

            {/* Inner container spans full width inside padded card */}
            <View className='w-full' onLayout={(e) => setChartW(e.nativeEvent.layout.width)}>
                {chartW > 0 && (
                    <BarChart
                        width={chartW}
                        stackData={stackData}
                        disableScroll
                        initialSpacing={0}
                        endSpacing={0}
                        spacing={spacing}
                        barWidth={barWidth}
                        yAxisLabelWidth={40}
                        yAxisColor='white'
                        xAxisColor='white'
                        yAxisThickness={0}
                        xAxisThickness={0}
                        autoShiftLabels={true}
                        yAxisTextStyle={{ fontSize: 12, fontFamily: 'SatoshiBlack' }}
                        xAxisLabelTextStyle={{
                            fontSize: 12,
                            fontFamily: 'SatoshiBlack',
                            // marginLeft: 'auto',
                            // marginRight: 'auto',
                        }}
                        hideRules
                        noOfSections={4}
                        formatYLabel={renderYAxisLabel}
                        // xAxisLabelsVerticalShift=s{200}
                    />
                )}
            </View>
        </View>
    );
}
