import { usePreferences } from '@/components/Settings/hooks';
import { AnimatedPillSelect } from '@/components/Shared/molecules/AnimatedPillSelect';
import { ScrollView, Text, View } from '@/components/Shared/styled';
import { ArrowNarrowDownRightIcon, ArrowNarrowUpRightIcon } from '@/components/SVG/icons/noscale';
import { satoshiFont } from '@/lib/constants/fonts';
import { getDateRange } from '@/lib/utils/date';
import { groupBy } from '@/lib/utils/helpers';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import { getMaxValue } from '@/lib/utils/object';
import React, { useMemo } from 'react';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import tw from 'twrnc';
import { useAccountReportStore, useAccountStore, useCalculateAccountData } from '../hooks';
import { TimePeriod } from '../schema';
import { generateNormalizedSpendChartDataWithMissingDays } from '../utils';
const datePeriods: TimePeriod[] = ['1M', '3M', '6M', 'YTD', '1Y', 'ALL'];

export default function AccountsAreaChart() {
    const { logEvent } = useAnalytics();
    const { category, setCategory, period, setPeriod, showChart } = useAccountReportStore();
    const { accounts } = useAccountStore();
    const {
        preferences: { currency },
    } = usePreferences();

    const { startDate, endDate } = useMemo(() => getDateRange(period), [period]);
    const groupedAccounts = useMemo(() => groupBy(accounts, 'category'), [accounts]);

    const accountGroupData = useCalculateAccountData({
        accountGroup: category,
        timePeriod: period,
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

    const handleCategoryChange = React.useCallback(
        (newCategory: string) => {
            setCategory(newCategory);
            logEvent('button_tap', {
                button: 'change_account_category',
                screen: 'accounts_screen',
                category: newCategory,
            });
        },
        [setCategory, logEvent],
    );

    const handlePeriodChange = React.useCallback(
        (newPeriod: TimePeriod) => {
            setPeriod(newPeriod);
            logEvent('button_tap', {
                button: 'change_chart_period',
                screen: 'accounts_screen',
                period: newPeriod,
            });
        },
        [setPeriod, logEvent],
    );

    console.log('group data', accountGroupData.transactions);

    if (!showChart) return null;

    return (
        <View className='relative flex flex-col'>
            <ScrollView
                horizontal
                contentContainerStyle={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingRight: 20,
                }}
                showsHorizontalScrollIndicator={false}
                className='py-5'
            >
                <View className='pl-5'>
                    <AnimatedPillSelect
                        options={['📈 NET WORTH', ...Object.keys(groupedAccounts)].map((p) => ({
                            label: p.toUpperCase(),
                            value: p,
                        }))}
                        selected={category}
                        onChange={handleCategoryChange}
                        styling={{
                            pill: {
                                backgroundColor: 'rgba(243, 232, 255, 0.5)',
                            },
                            background: {},
                            option: { ...tw`p-3` },
                        }}
                        renderItem={(opt, isSelected) => (
                            <Text
                                style={[
                                    satoshiFont.satoshiBold,
                                    isSelected ? styles.activeText : styles.inactiveText,
                                ]}
                                className='text-xs'
                            >
                                {opt.label}
                            </Text>
                        )}
                    />
                </View>
            </ScrollView>
            <View className='flex flex-col px-5'>
                <Text style={satoshiFont.satoshiBlack} className='text-2xl text-black'>
                    {formatCurrencyAccurate(currency, accountGroupData.currentBalance)}
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
                    </View>
                )}
            </View>
            <View className='relative mt-10'>
                {data.length < 2 && (
                    <View className='absolute left-0 right-0 top-[40%] items-center'>
                        <Text style={satoshiFont.satoshiBlack}>Not enough data</Text>
                    </View>
                )}
                <View className='-ml-[10px] scale-[1.05] h-[210]'>
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
            </View>
            <View className='flex flex-row w-full items-center px-5 mt-7'>
                <AnimatedPillSelect
                    options={datePeriods.map((p) => ({ label: p, value: p }))}
                    selected={period}
                    onChange={handlePeriodChange}
                    styling={{
                        pill: { backgroundColor: 'rgba(243, 232, 255, 0.5)' },
                        background: {},
                        option: { ...tw`p-3` },
                    }}
                    renderItem={(opt, isSelected) => (
                        <Text
                            style={[
                                satoshiFont.satoshiBold,
                                isSelected ? styles.activeText : styles.inactiveText,
                            ]}
                            className='text-xs'
                        >
                            {opt.label}
                        </Text>
                    )}
                />
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
