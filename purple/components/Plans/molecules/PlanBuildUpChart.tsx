import { Text, View } from '@/components/Shared/styled';
import { formatCurrencyRounded } from '@/lib/utils/number';
import React, { useMemo } from 'react';
import { LineChart } from 'react-native-gifted-charts';
import { usePlanStore } from '../hooks';
import { generateSpendingTrendData } from '../utils';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';

export default function PlanBuildUpChart() {
    const { currentPlan } = usePlanStore();

    const chartData = useMemo(() => {
        if (!currentPlan) {
            return { projected: [], actual: [], ideal: [] };
        }

        return generateSpendingTrendData(currentPlan, 30, 5);
    }, [currentPlan]);

    if (!currentPlan) return null;

    return (
        <View className='pt-10 w-full pl-2 flex flex-col'>
            <LineChart
                // width={200}
                height={220}
                rotateLabel
                // spacing={25}
                areaChart
                curved
                curvature={0.25}
                color1='#C026D3'
                color2='#15803D'
                data={chartData.ideal}
                data2={chartData.actual}
                // hideRules
                // hideYAxisText
                yAxisTextStyle={{
                    fontSize: 12,
                    fontFamily: 'GramatikaBold',
                }}
                // hide the line on the x axis
                // hideAxesAndRules
                spacing={9.8}
                noOfSections={5}
                // yAxisLabelPrefix='GHS '
                yAxisLabelWidth={70}
                startFillColor1='#A855F7'
                startFillColor2='#10B981'
                endFillColor2='#F0FDF4'
                startOpacity={0.5}
                endFillColor1='#FAF5FF'
                endOpacity={0.3}
                endSpacing={10}
                // maxValue={900}
                hideDataPoints
                yAxisColor='#C026D3'
                xAxisColor='#C026D3'
                // hideYAxisText
                // yAxisThickness={0}
                // rulesType="solid"
                // rulesColor="#F3E8FF"
                // yAxisTextStyle={{ color: "gray" }}
                // yAxisSide="right"
                // xAxisColor="lightgray"
                disableScroll
                hideRules
                // hideYAxisText
                // hide the line on the x axis
                // hideAxesAndRules
                // isAnimated
                animateOnDataChange
                animationDuration={1200}
                initialSpacing={0}
                adjustToWidth
                // spacing={30}
                thickness={2.5}
                xAxisLabelTextStyle={{
                    alignSelf: 'flex-end',
                    marginRight: 40,
                    marginTop: -44,
                }}
                labelsExtraHeight={50}
                // labelWidth={100}
                // showValuesAsTopLabel
                xAxisLabelsVerticalShift={20}
                formatYLabel={(value) => formatCurrencyRounded(Number(value), currentPlan.currency)}
            />

            <View className='flex flex-row justify-between items-center -mt-2.5 px-5 mx-auto space-x-2'>
                <View className='flex flex-row space-x-1 items-center'>
                    <View className='rounded-full w-2 h-2' style={{ backgroundColor: '#10B981' }} />
                    <Text style={GLOBAL_STYLESHEET.gramatikaBold} className='text-black text-xs'>
                        Actual {currentPlan.type == 'expense' ? 'Spending' : 'Saving'}
                    </Text>
                </View>
                <View className='flex flex-row space-x-1 items-center'>
                    <View className='rounded-full w-2 h-2' style={{ backgroundColor: '#A855F7' }} />
                    <Text style={GLOBAL_STYLESHEET.gramatikaBold} className='text-black text-xs'>
                        Optimal {currentPlan.type == 'expense' ? 'Spending' : 'Saving'}
                    </Text>
                </View>
            </View>
        </View>
    );
}
