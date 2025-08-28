import { usePreferences } from '@/components/Settings/hooks';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { ArrowNarrowDownRightIcon, ArrowNarrowUpRightIcon } from '@/components/SVG/icons/noscale';
import { satoshiFont } from '@/lib/constants/fonts';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import { getMaxValue } from '@/lib/utils/object';
import React, { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useAccountReportStore, useAccountStore, useCalculateAccountData } from '../hooks';
import { TimePeriod } from '../schema';
import { generateChartData, groupAccountsByCategory } from '../utils';
import { groupBy } from '@/lib/utils/helpers';

const datePeriods: TimePeriod[] = ['1M', '3M', '6M', '1Y', 'ALL'];

export default function AccountsAreaChart() {
    const { category, setCategory, period, setPeriod, showChart } = useAccountReportStore();
    const { accounts } = useAccountStore();
    const {
        preferences: { currency },
    } = usePreferences();
    const groupedAccounts = groupBy(accounts, 'category');
    const accountGroupData = useCalculateAccountData({
        accountGroup: category,
        timePeriod: period,
    });
    const { data, maxValue } = useMemo(() => {
        const transformedData = generateChartData(accountGroupData.transactions);
        return {
            data: transformedData,
            maxValue: getMaxValue(transformedData, 'value', 102),
        };
    }, [accountGroupData.transactions, category]);

    const handleCategoryChange = (category: string) => {
        setCategory(category);
    };

    const handlePeriodChange = (period: TimePeriod) => {
        setPeriod(period);
    };

    if (!showChart) return null;

    return (
        <View className='relative -ml-[5px] flex flex-col scale-[1.03] mb-2'>
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
                {['📈 NET WORTH', ...Object.keys(groupedAccounts)].map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.pill, category === cat && styles.activePill]}
                        className='rounded-full px-3.5 py-2'
                        onPress={() => handleCategoryChange(cat)}
                    >
                        <Text
                            style={[
                                satoshiFont.satoshiBold,
                                cat === category ? styles.activeText : styles.inactiveText,
                            ]}
                            className='text-xs'
                        >
                            {cat.toUpperCase()}
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
                    hideYAxisText
                    curvature={0.125}
                    adjustToWidth
                    color='#9810fa'
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
                {datePeriods.map((p) => (
                    <TouchableOpacity
                        key={p}
                        style={[styles.pill, p === period && styles.activePill]}
                        className='rounded-full px-3 py-1'
                        onPress={() => handlePeriodChange(p)}
                    >
                        <Text
                            style={[
                                satoshiFont.satoshiBold,
                                p === period ? styles.activeText : styles.inactiveText,
                            ]}
                            className='text-xs'
                        >
                            {p}
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
