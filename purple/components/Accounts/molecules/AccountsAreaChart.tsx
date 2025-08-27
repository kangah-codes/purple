import { usePreferences } from '@/components/Settings/hooks';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { ArrowNarrowDownRightIcon, ArrowNarrowUpRightIcon } from '@/components/SVG/icons/noscale';
import { satoshiFont } from '@/lib/constants/fonts';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import { getMaxValue } from '@/lib/utils/object';
import React, { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { transactions } from '../constants';
import { useAccountStore, useCalculateAccountData } from '../hooks';
import { TimePeriod } from '../schema';
import { generateChartData, groupAccountsByCategory } from '../utils';

const datePeriods: TimePeriod[] = ['1M', '3M', '6M', '1Y', 'ALL'];

export default function AccountsAreaChart() {
    const { accounts } = useAccountStore();
    const {
        preferences: { currency },
    } = usePreferences();
    const groupedAccounts = groupAccountsByCategory(accounts);
    const [selectedCategory, setSelectedCategory] = useState('📈 NET WORTH');
    const [selectedPeriod, setSelectedPeriod] = useState(datePeriods[0]);
    const accountGroupData = useCalculateAccountData({
        accountGroup: selectedCategory,
        timePeriod: selectedPeriod,
    });
    const { data, maxValue } = useMemo(() => {
        const transformedData = generateChartData(accountGroupData.transactions);
        return {
            data: transformedData,
            maxValue: getMaxValue(transformedData, 'value', 102),
        };
    }, [accountGroupData.transactions, selectedCategory]);

    const handleCategoryChange = (period: string) => {
        setSelectedCategory(period);
    };

    const handlePeriodChange = (period: TimePeriod) => {
        setSelectedPeriod(period);
    };

    console.log(data, 'CHARTDATA', JSON.stringify(accountGroupData));

    return (
        <View className='relative -ml-[5px] flex flex-col scale-[1.03]'>
            <ScrollView
                horizontal
                contentContainerStyle={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingRight: 60,
                }}
                showsHorizontalScrollIndicator={false}
                className='py-5 px-8'
            >
                {['📈 NET WORTH', ...Object.keys(groupedAccounts)].map((category) => (
                    <TouchableOpacity
                        key={category}
                        style={[styles.pill, selectedCategory === category && styles.activePill]}
                        className='rounded-full px-3.5 py-2'
                        onPress={() => handleCategoryChange(category)}
                    >
                        <Text
                            style={[
                                satoshiFont.satoshiBold,
                                selectedCategory === category
                                    ? styles.activeText
                                    : styles.inactiveText,
                            ]}
                            className='text-xs'
                        >
                            {category.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <View className='flex flex-col px-8'>
                <Text style={satoshiFont.satoshiBlack} className='text-2xl text-black'>
                    {formatCurrencyAccurate(currency, accountGroupData.currentBalance)}
                </Text>
                {accountGroupData.percentageChange != 0 && (
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
                                accountGroupData.currentBalance,
                            )}{' '}
                            ({accountGroupData.percentageChange}%)
                        </Text>
                    </View>
                )}
            </View>
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
                    isAnimated
                    hideYAxisText
                    // curved
                    curvature={0.125}
                    // hideAxesAndRules
                    adjustToWidth
                    color='#9810fa'
                    // thickness={2.125}
                    startFillColor='#9810fa'
                    endFillColor='#7E22CE'
                    startOpacity={0.5}
                    endOpacity={0}
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
            <View className='flex flex-row justify-between items-center px-8'>
                {datePeriods.map((period) => (
                    <TouchableOpacity
                        key={period}
                        style={[styles.pill, selectedPeriod === period && styles.activePill]}
                        className='rounded-full px-3 py-1'
                        onPress={() => handlePeriodChange(period)}
                    >
                        <Text
                            style={[
                                satoshiFont.satoshiBold,
                                selectedPeriod === period ? styles.activeText : styles.inactiveText,
                            ]}
                            className='text-xs'
                        >
                            {period}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    pill: {
        backgroundColor: 'transparent',
    },
    activePill: {
        backgroundColor: 'rgba(243, 232, 255, 0.7)',
    },
    activeText: {
        color: '#8200db',
        fontFamily: satoshiFont.satoshiBlack.fontFamily,
    },
    inactiveText: {
        color: '#c27aff',
    },
});
