import { Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { formatCurrencyRounded } from '@/lib/utils/number';
import React, { useMemo } from 'react';
import { LineChart } from 'react-native-gifted-charts';
import { usePlanStore } from '../hooks';
import { generateSpendingTrendData } from '../utils';

export default function PlanBuildUpChart() {
    const { currentPlan } = usePlanStore();

    const { chartData, maxValue } = useMemo(() => {
        if (!currentPlan) {
            return { chartData: { projected: [], actual: [], ideal: [] }, maxValue: 0 };
        }

        const chartData = generateSpendingTrendData(currentPlan, 30, 5);
        const allValues = [
            ...chartData.actual.map((item) => item.value),
            ...chartData.ideal.map((item) => item.value),
        ];
        const maxValue = Math.max(...allValues, 0);

        return { chartData, maxValue };
    }, [currentPlan?.transactions]);

    if (!currentPlan) return null;

    return (
        <View className='pt-10 w-full pl-2 flex flex-col'>
            <LineChart
                height={220}
                rotateLabel
                areaChart
                curved
                curvature={0.25}
                color1='#C026D3'
                color2='#15803D'
                data={chartData.ideal}
                data2={chartData.actual}
                yAxisTextStyle={{
                    fontSize: 12,
                    fontFamily: 'SatoshiBlack',
                }}
                xAxisLabelTextStyle={{
                    fontSize: 12,
                    fontFamily: 'SatoshiBlack',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    alignSelf: 'flex-end',
                    marginTop: -44,
                }}
                spacing={9.8}
                noOfSections={5}
                yAxisLabelWidth={70}
                startFillColor1='#A855F7'
                startFillColor2='#10B981'
                endFillColor2='#F0FDF4'
                startOpacity={0.5}
                endFillColor1='#FAF5FF'
                endOpacity={0.3}
                endSpacing={10}
                maxValue={maxValue * 1.1} // Add 10% padding
                hideDataPoints
                yAxisColor='#C026D3'
                xAxisColor='#C026D3'
                disableScroll
                hideRules
                animateOnDataChange
                animationDuration={1200}
                initialSpacing={0}
                adjustToWidth
                thickness={2.5}
                labelsExtraHeight={50}
                xAxisLabelsVerticalShift={20}
                formatYLabel={(value) => formatCurrencyRounded(Number(value), currentPlan.currency)}
            />

            <View className='flex flex-row justify-between items-center -mt-2.5 px-5 mx-auto space-x-2'>
                <View className='flex flex-row space-x-1 items-center'>
                    <View className='rounded-full w-2 h-2' style={{ backgroundColor: '#10B981' }} />
                    <Text style={satoshiFont.satoshiBold} className='text-black text-xs'>
                        Actual {currentPlan.type == 'expense' ? 'Spending' : 'Saving'}
                    </Text>
                </View>
                <View className='flex flex-row space-x-1 items-center'>
                    <View className='rounded-full w-2 h-2' style={{ backgroundColor: '#A855F7' }} />
                    <Text style={satoshiFont.satoshiBold} className='text-black text-xs'>
                        Optimal {currentPlan.type == 'expense' ? 'Spending' : 'Saving'}
                    </Text>
                </View>
            </View>
        </View>
    );
}
