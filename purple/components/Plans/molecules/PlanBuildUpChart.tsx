import { View } from '@/components/Shared/styled';
import React from 'react';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { SpendingTrendData } from '../schema';

const screenDimensions = Dimensions.get('screen');

type PlanBuildUpChartProps = {
    chartData: SpendingTrendData;
};

export default function PlanBuildUpChart({ chartData }: PlanBuildUpChartProps) {
    return (
        <View
            className='pt-10 -ml-3 mr-3'
            style={{
                width: screenDimensions.width + 11,
            }}
        >
            <LineChart
                width={screenDimensions.width}
                height={220}
                rotateLabel
                // spacing={25}
                areaChart
                curved
                curvature={0.025}
                color1='#A855F7'
                color2='#DB2777'
                data={chartData.ideal}
                data2={chartData.actual}
                // hideRules
                hideYAxisText
                // hide the line on the x axis
                // hideAxesAndRules
                // spacing={9.2}
                // noOfSections={4}
                startFillColor='#A855F7'
                startOpacity={0.5}
                endFillColor='#FAF5FF'
                endOpacity={0.3}
                // maxValue={900}
                hideDataPoints
                yAxisColor='white'
                xAxisColor={'white'}
                // hideYAxisText
                // yAxisThickness={0}
                // rulesType="solid"
                // rulesColor="#F3E8FF"
                // yAxisTextStyle={{ color: "gray" }}
                // yAxisSide="right"
                // xAxisColor="lightgray"
                disableScroll
                // hideRules
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
            />
        </View>
    );
}
