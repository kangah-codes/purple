import { ScrollView } from '@/components/Shared/styled';
import { Transaction } from '@/components/Transactions/schema';
import React, { useMemo } from 'react';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { createTransactionChartData } from '../utils';

export default function AccountActivityAreaChart({
    transactions,
}: {
    transactions: Transaction[];
}) {
    const chartData = useMemo(() => createTransactionChartData(transactions, 5), [transactions]);
    const scrollRef = React.useRef<typeof ScrollView>(null);

    if (transactions.length < 2) return null;

    return (
        <ScrollView
            horizontal
            className='pt-10 -ml-3 mr-3'
            style={{
                width: Dimensions.get('window').width + 12,
            }}
            ref={scrollRef}
            showsHorizontalScrollIndicator={false}
        >
            <LineChart
                // width={Dimensions.get('window').width}
                height={200}
                rotateLabel
                scrollRef={scrollRef}
                focusEnabled
                // spacing={25}
                areaChart
                curved
                curvature={0.025}
                color='#A855F7'
                data={chartData}
                // hideRules
                hideYAxisText
                // hide the line on the x axis
                // hideAxesAndRules
                // spacing={9.2}
                noOfSections={4}
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
                // disableScroll
                // hideYAxisText
                // hide the line on the x axis
                // hideAxesAndRules
                // isAnimated
                hideRules
                animateOnDataChange
                animationDuration={1200}
                initialSpacing={0}
                adjustToWidth
                // spacing={30}
                thickness={2.5}
                yAxisTextStyle={{
                    fontSize: 12,
                    fontFamily: 'GramatikaBold',
                }}
                xAxisLabelTextStyle={{
                    alignSelf: 'flex-end',
                    marginRight: 40,
                    marginTop: -44,
                }}
                labelsExtraHeight={50}
                xAxisLabelsVerticalShift={40}
            />
        </ScrollView>
    );
}
