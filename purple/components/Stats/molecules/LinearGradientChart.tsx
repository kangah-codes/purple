import React from 'react';
import { View, Text } from '@/components/Shared/styled';
import { LinearGradient, Stop } from 'react-native-svg';
import { BarChart, LineChart, PieChart, PopulationPyramid } from 'react-native-gifted-charts';

const LinearGradientChart = () => {
    const ptData = [
        { value: 160, date: '1 Apr 2022' },
        { value: 180, date: '2 Apr 2022' },
        { value: 190, date: '3 Apr 2022' },
        { value: 180, date: '4 Apr 2022' },
        { value: 140, date: '5 Apr 2022' },
        { value: 145, date: '6 Apr 2022' },
        { value: 160, date: '7 Apr 2022' },
        { value: 200, date: '8 Apr 2022' },

        { value: 220, date: '9 Apr 2022' },
        {
            value: 240,
            date: '10 Apr 2022',
        },
        { value: 280, date: '11 Apr 2022' },
        { value: 260, date: '12 Apr 2022' },
        { value: 340, date: '13 Apr 2022' },
        { value: 385, date: '14 Apr 2022' },
        { value: 280, date: '15 Apr 2022' },
        { value: 390, date: '16 Apr 2022' },

        { value: 370, date: '17 Apr 2022' },
        { value: 285, date: '18 Apr 2022' },
        { value: 295, date: '19 Apr 2022' },
        {
            value: 300,
            date: '20 Apr 2022',
        },
        { value: 280, date: '21 Apr 2022' },
        { value: 295, date: '22 Apr 2022' },
        { value: 260, date: '23 Apr 2022' },
        { value: 255, date: '24 Apr 2022' },

        { value: 190, date: '25 Apr 2022' },
        { value: 220, date: '26 Apr 2022' },
        { value: 205, date: '27 Apr 2022' },
        { value: 230, date: '28 Apr 2022' },
        { value: 210, date: '29 Apr 2022' },
        {
            value: 200,
            date: '30 Apr 2022',
        },
        { value: 240, date: '1 May 2022' },
        { value: 250, date: '2 May 2022' },
        { value: 280, date: '3 May 2022' },
        { value: 250, date: '4 May 2022' },
        { value: 210, date: '5 May 2022' },
    ];

    return (
        <View className='px-5 pl-2.5 relative'>
            <View className='absolute right-5 top-5'>
                <Text
                    style={{
                        fontFamily: 'Suprapower',
                    }}
                >
                    Total Spend: GHS 9,036.87
                </Text>
            </View>
            <LineChart
                areaChart
                data={ptData}
                rotateLabel
                // width={300}
                hideDataPoints
                hideRules
                hideYAxisText
                // hide the line on the x axis
                hideAxesAndRules
                // spacing={9.2}
                adjustToWidth
                color='#7E22CE'
                thickness={2}
                startFillColor='#7E22CE'
                endFillColor='#E9D5FF'
                startOpacity={0.9}
                endOpacity={0.2}
                initialSpacing={0}
                maxValue={900}
                yAxisColor='white'
                yAxisThickness={0}
                rulesType='solid'
                rulesColor='#F3E8FF'
                yAxisTextStyle={{ color: 'gray' }}
                // yAxisSide="right"
                xAxisColor='lightgray'
                disableScroll
                pointerConfig={{
                    pointerStripHeight: 140,
                    pointerStripColor: 'lightgray',
                    pointerStripWidth: 2,
                    pointerColor: 'lightgray',
                    radius: 6,
                    pointerLabelWidth: 60,
                    pointerLabelHeight: 90,
                    activatePointersOnLongPress: true,
                    autoAdjustPointerLabelPosition: false,
                    pointerLabelComponent: (items: { date: string; value: number }[]) => {
                        return (
                            <View className='items-center justify-center ml-[-40] bg-white mt-6 pb-2 z-10'>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontSize: 14,
                                        marginBottom: 6,
                                        textAlign: 'center',
                                    }}
                                >
                                    {items[0].date}
                                </Text>

                                <View className='bg-purple-100 rounded-full px-2 py-1'>
                                    <Text
                                        style={{
                                            fontFamily: 'Suprapower',
                                        }}
                                        className='text-xs text-center'
                                    >
                                        {'$' + items[0].value + '.0'}
                                    </Text>
                                </View>
                            </View>
                        );
                    },
                }}
            />
        </View>
    );
};

export default LinearGradientChart;
