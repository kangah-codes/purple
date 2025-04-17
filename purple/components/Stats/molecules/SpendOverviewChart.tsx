import { ScrollView, View } from '@/components/Shared/styled';
import { useTransactionStore } from '@/components/Transactions/hooks';
import { Transaction } from '@/components/Transactions/schema';
import React, { useMemo } from 'react';
import { Dimensions } from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import {
    generateMockTransactionsForMonth,
    getStackedChartData,
    getWeekRangesForMonth,
} from '../utils';
import WeekLegend from './SpendOverviewLegend';

export default function SpendOverviewChart() {
    const { transactions } = useTransactionStore();
    const mockAprilTx = generateMockTransactionsForMonth(new Date('2025-04-01'));

    const stackData = useMemo(() => getStackedChartData(transactions), [transactions]);
    const weekRanges = getWeekRangesForMonth(new Date());

    console.log(stackData.map((stack) => [stack.label, stack.stacks]));

    return (
        <View className='pt-5'>
            <View className='px-5 mb-5'>
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
