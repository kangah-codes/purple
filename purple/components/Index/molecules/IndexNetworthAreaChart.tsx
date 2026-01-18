import { useCalculateAccountData } from '@/components/Accounts/hooks';
import { generateNormalizedSpendChartDataWithMissingDays } from '@/components/Accounts/utils';
import { usePreferences } from '@/components/Settings/hooks';
import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import { Text, View } from '@/components/Shared/styled';
import { ArrowNarrowDownRightIcon, ArrowNarrowUpRightIcon } from '@/components/SVG/icons/noscale';
import { satoshiFont } from '@/lib/constants/fonts';
import { getDateRange } from '@/lib/utils/date';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import { getMaxValue } from '@/lib/utils/object';
import React, { memo, useMemo } from 'react';
import { LineChart } from 'react-native-gifted-charts';

export function IndexNetworthAreaChart() {
    const {
        preferences: { currency },
    } = usePreferences();
    const { startDate, endDate } = getDateRange('1M');
    const accountGroupData = useCalculateAccountData({
        accountGroup: '📈 NET WORTH',
        timePeriod: '1M',
    });
    const { data, maxValue } = useMemo(() => {
        const transformedData = generateNormalizedSpendChartDataWithMissingDays(
            accountGroupData.transactions,
            startDate,
            endDate,
            accountGroupData.previousBalance,
        );
        return {
            data: transformedData,
            maxValue: getMaxValue(transformedData, 'value', 102),
        };
    }, [accountGroupData.transactions, startDate, endDate, accountGroupData.previousBalance]);

    return (
        <View className='relative flex flex-col pt-5'>
            <View className='flex flex-col px-10'>
                <Text style={satoshiFont.satoshiBlack} className='text-base text-black'>
                    {formatCurrencyAccurate(currency, accountGroupData.currentBalance)} net worth
                </Text>

                {accountGroupData.percentageChange !== 0 && (
                    <View className='flex flex-row items-center space-x-1'>
                        {accountGroupData.trend === 'increase' ? (
                            <ArrowNarrowUpRightIcon width={16} height={16} stroke='#A855F7' />
                        ) : (
                            <ArrowNarrowDownRightIcon width={16} height={16} stroke='#fb2c36' />
                        )}
                        <Text
                            style={[
                                satoshiFont.satoshiBold,
                                {
                                    color:
                                        accountGroupData.trend === 'increase'
                                            ? '#A855F7'
                                            : '#fb2c36',
                                },
                            ]}
                            className='text-xs'
                        >
                            {formatCurrencyAccurate(
                                accountGroupData.currency,
                                accountGroupData.absoluteChange,
                            )}{' '}
                            ({accountGroupData.percentageChange}%)
                        </Text>
                        <Text style={[satoshiFont.satoshiBold]} className='text-xs'>
                            (1 month)
                        </Text>
                    </View>
                )}
            </View>
            <View className='relative mt-5 -mx-5'>
                {data.length < 2 && (
                    <View className='absolute left-0 right-0 top-0 items-center'>
                        <EmptyList
                            imageDetails={{
                                width: 100,
                                height: 100,
                            }}
                        />
                    </View>
                )}
                <View className='h-[200px]'>
                    <LineChart
                        areaChart
                        data={data}
                        rotateLabel
                        maxValue={maxValue}
                        hideDataPoints
                        hideRules
                        hideYAxisText
                        curvature={0.125}
                        adjustToWidth
                        color='#9810fa'
                        startFillColor='#9810fa'
                        endFillColor='#faf5ff'
                        startOpacity={0.5}
                        endOpacity={0.5}
                        initialSpacing={0}
                        yAxisColor='white'
                        yAxisThickness={0}
                        rulesType='solid'
                        rulesColor='#F3E8FF'
                        disableScroll
                        xAxisType='dotted'
                        xAxisColor='lightgray'
                        xAxisThickness={2}
                        dashWidth={4}
                        dashGap={4}
                    />
                </View>
            </View>
        </View>
    );
}

export default memo(IndexNetworthAreaChart);
