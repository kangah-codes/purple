import { usePreferences } from '@/components/Settings/hooks';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { Transaction } from '@/components/Transactions/schema';
import { isTransferTransaction } from '@/components/Transactions/utils';
import { satoshiFont } from '@/lib/constants/fonts';
import { generatePalette } from '@/lib/utils/colour';
import { formatCurrencyRounded } from '@/lib/utils/number';
import CurrencyService from '@/lib/services/CurrencyService';
import React, { memo, useMemo, useState } from 'react';

const paletteCache = new Map<string, string>();

const getCachedColor = (category: string): string => {
    if (!paletteCache.has(category)) {
        paletteCache.set(category, generatePalette(category).color500);
    }
    return paletteCache.get(category)!;
};

type SpendOverviewProps = {
    transactions: Transaction[];
};

type CategorySlice = {
    category: string;
    amount: number;
    percent: number;
    color: string;
};

function SegmentedBar({
    slices,
    emptyColor = '#E9D8FD',
    height = 8,
    radius = 8,
}: {
    slices: CategorySlice[];
    emptyColor?: string;
    height?: number;
    radius?: number;
}) {
    const hasData = slices.reduce((sum, s) => sum + s.amount, 0) > 0;

    if (!hasData) {
        return (
            <View
                className='w-full'
                style={{
                    height,
                    borderRadius: radius,
                    backgroundColor: emptyColor,
                }}
            />
        );
    }

    return (
        <View
            className='w-full flex-row overflow-hidden space-x-0.5'
            style={{ height, borderRadius: radius }}
        >
            {slices.map((slice) => {
                return (
                    <View
                        key={slice.category}
                        style={[
                            {
                                width: `${slice.percent}%`,
                                backgroundColor: slice.color,
                                height,
                            },
                        ]}
                        className='rounded-full'
                    />
                );
            })}
        </View>
    );
}

export default function SpendOverview({ transactions }: SpendOverviewProps) {
    const {
        preferences: { currency },
    } = usePreferences();
    const currencyService = CurrencyService.getInstance();

    const { totalDebits, totalCredits, creditSlices, debitSlices } = useMemo(() => {
        const debitMap: Record<string, number> = {};
        const creditMap: Record<string, number> = {};
        let totalDebits = 0;
        let totalCredits = 0;

        for (const tx of transactions) {
            if (!tx?.amount || !tx?.type || !tx?.category) continue;

            // Skip transactions that are part of transfers to avoid inflating income/expense totals
            if (isTransferTransaction(tx)) continue;

            const convertedAmount = currencyService.convertCurrencySync({
                // @ts-expect-error ignore
                from: { currency: tx.currency, amount: tx.amount },
                // @ts-expect-error ignore
                to: { currency },
            });

            if (tx.type === 'debit') {
                totalDebits += convertedAmount;
                debitMap[tx.category] = (debitMap[tx.category] || 0) + convertedAmount;
            } else if (tx.type === 'credit') {
                totalCredits += convertedAmount;
                creditMap[tx.category] = (creditMap[tx.category] || 0) + convertedAmount;
            }
        }

        const toSlices = (map: Record<string, number>, total: number): CategorySlice[] => {
            const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
            return entries.map(([category, amount]) => ({
                category,
                amount,
                percent: total === 0 ? 0 : (amount / total) * 100,
                color: getCachedColor(category),
            }));
        };

        return {
            totalDebits,
            totalCredits,
            creditSlices: toSlices(creditMap, totalCredits),
            debitSlices: toSlices(debitMap, totalDebits),
        };
    }, [transactions]);

    const [expandedCreditLegend, setExpandedCreditLegend] = useState(false);
    const [expandedDebitLegend, setExpandedDebitLegend] = useState(false);

    const renderLegend = (
        slices: CategorySlice[],
        total: number,
        expanded: boolean,
        setExpanded: (v: boolean) => void,
    ) => {
        const maxItems = 6;
        const showToggle = slices.length > maxItems;
        const displaySlices = expanded ? slices : slices.slice(0, maxItems);

        return (
            <View className='flex flex-col'>
                <View className='flex flex-row flex-wrap'>
                    {displaySlices.map((slice) => {
                        const percent = total === 0 ? 0 : Math.round((slice.amount / total) * 100);
                        return (
                            <View
                                key={slice.category}
                                className='flex-row items-center mb-2 space-x-1'
                                style={{ maxWidth: '48%', marginRight: 10 }}
                            >
                                <View
                                    className='w-2 h-2 rounded-full'
                                    style={{ backgroundColor: slice.color }}
                                />
                                <Text style={[satoshiFont.satoshiBold]} className='text-xs ml-1.5'>
                                    {slice.category.split(' ').slice(1).join('')}{' '}
                                    <Text style={[satoshiFont.satoshiBlack]} className='text-xs'>
                                        {percent}%
                                    </Text>
                                </Text>
                            </View>
                        );
                    })}
                </View>

                {showToggle && (
                    <TouchableOpacity
                        onPress={() => setExpanded(!expanded)}
                        className='flex flex-row'
                    >
                        <Text
                            style={satoshiFont.satoshiBold}
                            className='text-xs text-purple-600 mr-1'
                        >
                            {expanded ? 'Show less' : 'Show more'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View className='flex flex-col space-y-5'>
            <View className='flex flex-col space-y-2.5 pr-11'>
                <View>
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-500'>
                        Income
                    </Text>
                </View>
                <View>
                    <Text style={satoshiFont.satoshiBlack} className='text-2xl text-black'>
                        {formatCurrencyRounded(totalCredits, currency)}
                    </Text>
                </View>

                <View>
                    <SegmentedBar slices={creditSlices} />
                </View>

                {renderLegend(
                    creditSlices,
                    totalCredits,
                    expandedCreditLegend,
                    setExpandedCreditLegend,
                )}
            </View>

            <View className='h-[1px] border-b border-purple-100' />

            <View className='flex flex-col space-y-2.5 pr-11'>
                <View>
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-500'>
                        Expenses
                    </Text>
                </View>
                <View>
                    <Text style={satoshiFont.satoshiBlack} className='text-2xl text-black'>
                        {formatCurrencyRounded(totalDebits, currency)}
                    </Text>
                </View>

                <View>
                    <SegmentedBar slices={debitSlices} />
                </View>

                {renderLegend(
                    debitSlices,
                    totalDebits,
                    expandedDebitLegend,
                    setExpandedDebitLegend,
                )}
            </View>
        </View>
    );
}

export default memo(SpendOverview);
