import { Text, View } from '@/components/Shared/styled';
import { Transaction } from '@/components/Transactions/schema';
import { satoshiFont } from '@/lib/constants/fonts';
import { getMaxValue } from '@/lib/utils/object';
import React, { useMemo } from 'react';
import { LineChart } from 'react-native-gifted-charts';
import { generateNormalizedSpendChartDataWithMissingDays } from '../utils';
import AccountActivityDateFilter from './AccountActivityDateFilter';
import { useAccountStore } from '../hooks';
import { getDateRange } from '@/lib/utils/date';

type AccountActivityAreaChartProps = {
    transactions: Transaction[];
};

export default function AccountActivityAreaChart({ transactions }: AccountActivityAreaChartProps) {
    const {
        currentAccountRequestParams: { currentSelection },
    } = useAccountStore();
    const { startDate, endDate } = getDateRange(currentSelection || '1W');
    const { data, maxValue } = useMemo(() => {
        const transformedData = generateNormalizedSpendChartDataWithMissingDays(
            transactions,
            startDate,
            endDate,
        );
        return {
            data: transformedData,
            maxValue: getMaxValue(transformedData, 'value', 10),
        };
    }, [transactions]);

    console.log(data);

    return (
        <View className='relative -ml-[5px] flex flex-col scale-[1.03]'>
            <View className='relative mt-10'>
                {data.length < 2 && (
                    <View className='absolute left-0 right-0 top-[40%] items-center'>
                        <Text style={satoshiFont.satoshiBlack}>Not enough data</Text>
                    </View>
                )}

                <LineChart
                    areaChart
                    data={data}
                    rotateLabel
                    maxValue={maxValue}
                    hideDataPoints
                    hideRules
                    hideYAxisText
                    // curved
                    hideAxesAndRules
                    adjustToWidth
                    color='#7E22CE'
                    thickness={2.125}
                    startFillColor='#7E22CE'
                    endFillColor='#7E22CE'
                    startOpacity={0.5}
                    endOpacity={0}
                    initialSpacing={0}
                    yAxisColor='white'
                    yAxisThickness={0}
                    rulesType='solid'
                    rulesColor='#F3E8FF'
                    disableScroll
                />
            </View>
            <AccountActivityDateFilter />
        </View>
    );
}
