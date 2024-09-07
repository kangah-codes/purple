import { View } from '@/components/Shared/styled';
import { BarChart, LineChart } from 'react-native-gifted-charts';

export default function SpendTrendAreaChart() {
    const data = Array.from({ length: 30 }, (_, i) => ({
        value: Math.floor(Math.random() * 400),
        date: `${i + 1} Apr 2022`,
    }));

    return (
        <LineChart
            // width={}
            rotateLabel
            // spacing={25}
            areaChart
            curved
            color='#581C87'
            data={data}
            // hideRules
            // hideYAxisText
            // hide the line on the x axis
            // hideAxesAndRules
            // spacing={9.2}
            noOfSections={3}
            startFillColor='#7E22CE'
            startOpacity={0.8}
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
            hideRules

            // hideYAxisText
            // hide the line on the x axis
            // hideAxesAndRules
        />
    );
}
