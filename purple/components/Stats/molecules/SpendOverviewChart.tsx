import { Text, View } from '@/components/Shared/styled';
import { Transaction } from '@/components/Transactions/schema';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import React, { useMemo } from 'react';
import { BarChart } from 'react-native-gifted-charts';
import { getStackedChartData, getWeekRangesForMonth } from '../utils';
import WeekLegend from './SpendOverviewLegend';
import { generatePalette } from '@/lib/utils/colour';

type SpendOverviewChartProps = {
    transactions: Transaction[];
};

export default function SpendOverviewChart({ transactions }: SpendOverviewChartProps) {
    const { stackData, weekRanges, palette } = useMemo(() => {
        return {
            stackData: getStackedChartData(transactions),
            weekRanges: getWeekRangesForMonth(new Date()),
            palette: generatePalette(new Date().toISOString()),
        };
    }, [transactions]);

    console.log(palette);

    return (
        <View className='pt-5 flex flex-col space-y-2.5 px-5 mb-5'>
            <Text className='text-base text-black' style={GLOBAL_STYLESHEET.satoshiBlack}>
                Spend Overview
            </Text>
            <View className='mb-5'>
                <BarChart
                    // width={Dimensions.get('window').width}
                    adjustToWidth
                    height={250}
                    barWidth={40}
                    spacing={5}
                    noOfSections={2}
                    barBorderRadius={9}
                    // frontColor='#ad46ff'
                    // data={barData}
                    stackData={stackData}
                    yAxisThickness={0}
                    xAxisThickness={0}
                    // color='#ad46ff'
                    yAxisTextStyle={{
                        fontSize: 12,
                        fontFamily: 'SatoshiBlack',
                    }}
                    xAxisLabelTextStyle={{
                        fontSize: 12,
                        fontFamily: 'SatoshiBlack',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }}
                    hideRules
                />
            </View>
            <WeekLegend weekRanges={weekRanges} />
        </View>
    );
}
