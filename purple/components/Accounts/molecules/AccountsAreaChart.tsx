import { ScrollView, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { Transaction } from '@/components/Transactions/schema';
import { satoshiFont } from '@/lib/constants/fonts';
import { getMaxValue } from '@/lib/utils/object';
import React, { useMemo, useState } from 'react';
import { LineChart } from 'react-native-gifted-charts';
import { generateChartData, groupAccountsByCategory } from '../utils';
import AccountActivityDateFilter from './AccountActivityDateFilter';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import { StyleSheet } from 'react-native';
import { generateMockTransactionsForMonth } from '@/components/Stats/utils';
import { transactions } from '../constants';
import { ArrowNarrowUpRightIcon } from '@/components/SVG/icons/noscale';
import { useAccountStore } from '../hooks';
import { usePreferences } from '@/components/Settings/hooks';

type AccountsAreaChartProps = {
    transactions: Transaction[];
};

const accountCategories = ['NET WORTH', 'CASH', 'BANK ACCOUNTS', 'INVESTMENTS', 'LIABILITIES'];
const datePeriods = ['1M', '3M', '6M', '1Y', 'ALL'];

export default function AccountsAreaChart() {
    const { accounts } = useAccountStore();
    const {
        preferences: { currency },
    } = usePreferences();
    const groupedAccounts = groupAccountsByCategory(accounts);
    const { data, maxValue } = useMemo(() => {
        const transformedData = generateChartData(transactions);
        return {
            data: transformedData,
            maxValue: getMaxValue(transformedData, 'value', 102),
        };
    }, []);
    const [selectedCategory, setSelectedCategory] = useState('📈 NET WORTH');
    const [selectedPeriod, setSelectedPeriod] = useState(datePeriods[1]);

    const handleCategoryChange = (period: string) => {
        setSelectedCategory(period);
    };

    const handlePeriodChange = (period: string) => {
        setSelectedPeriod(period);
    };

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
                    {formatCurrencyAccurate(currency, 45602.83)}
                </Text>
                <View className='flex flex-row items-center space-x-1'>
                    <ArrowNarrowUpRightIcon width={16} height={16} stroke='#A855F7' />

                    <Text
                        style={[satoshiFont.satoshiBold, { color: '#A855F7' }]}
                        className='text-xs'
                    >
                        {formatCurrencyAccurate('USD', 32)} (3.5%) 1 month
                    </Text>
                </View>
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
                    curved
                    curvature={0.125}
                    // hideAxesAndRules
                    adjustToWidth
                    color='#7E22CE'
                    // thickness={2.125}
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
