import React, { useState, useEffect } from 'react';
import { View } from '@/components/Shared/styled';
import RangeSlider from '@/components/Shared/molecules/RangeSlider';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { usePreferences } from '@/components/Settings/hooks';
import { useTransactionStore } from '@/components/Transactions/hooks';

interface TransactionAmountFilterProps {
    minLimit?: number;
    maxLimit?: number;
    step?: number;
}

export default function TransactionAmountFilter({
    minLimit = 0,
    maxLimit = 10000,
    step = 10,
}: TransactionAmountFilterProps) {
    const { pendingTransactionsFilter, setPendingTransactionsFilter } = useTransactionStore();
    const [selectedMin, setSelectedMin] = useState(
        pendingTransactionsFilter.min_amount ?? minLimit,
    );
    const [selectedMax, setSelectedMax] = useState(
        pendingTransactionsFilter.max_amount ?? maxLimit,
    );
    const {
        preferences: { currency },
    } = usePreferences();

    // Reset local state when global filter is reset
    useEffect(() => {
        setSelectedMin(pendingTransactionsFilter.min_amount ?? minLimit);
        setSelectedMax(pendingTransactionsFilter.max_amount ?? maxLimit);
    }, [
        pendingTransactionsFilter.min_amount,
        pendingTransactionsFilter.max_amount,
        minLimit,
        maxLimit,
    ]);

    const formatCurrency = (value: number) => {
        return formatCurrencyRounded(value, currency);
    };

    const handleRangeChange = (min: number, max: number) => {
        setSelectedMin(min);
        setSelectedMax(max);
    };

    // Update global filter when local values change
    useEffect(() => {
        const newMin = selectedMin === minLimit ? undefined : selectedMin;
        const newMax = selectedMax === maxLimit ? undefined : selectedMax;

        // Only update if values have changed
        if (
            newMin !== pendingTransactionsFilter.min_amount ||
            newMax !== pendingTransactionsFilter.max_amount
        ) {
            setPendingTransactionsFilter({
                ...pendingTransactionsFilter,
                min_amount: newMin,
                max_amount: newMax,
            });
        }
    }, [
        selectedMin,
        selectedMax,
        pendingTransactionsFilter,
        setPendingTransactionsFilter,
        minLimit,
        maxLimit,
    ]);

    return (
        <View className='p-5 bg-purple-50'>
            <RangeSlider
                min={minLimit}
                max={maxLimit}
                step={step}
                initialMin={selectedMin}
                initialMax={selectedMax}
                onValueChange={handleRangeChange}
                formatValue={formatCurrency}
                trackColor='#c27aff'
                activeTrackColor='#8b5cf6'
                thumbColor='#8b5cf6'
                trackHeight={5}
                thumbSize={23}
                showLabels={true}
                thumbStyle={{
                    borderWidth: 3,
                    borderColor: '#faf5ff',
                }}
            />

            <View className='mt-0.5 bg-purple-50 rounded-lg'>
                {/* <Text style={satoshiFont.satoshiBold} className='text-xs text-black text-center'>
                    Filtering for transactions between {formatCurrency(selectedMin)} and{' '}
                    {formatCurrencyAccurate(currency, selectedMax)}
                </Text> */}
            </View>
        </View>
    );
}

export function useTransactionAmountFilter(
    minLimit = 0,
    maxLimit = 10000,
    initialMin?: number,
    initialMax?: number,
) {
    const [range, setRange] = useState({
        min: initialMin ?? minLimit,
        max: initialMax ?? maxLimit,
    });

    const updateRange = (min: number, max: number) => {
        setRange({ min, max });
    };

    const clearRange = () => {
        setRange({ min: minLimit, max: maxLimit });
    };

    const hasCustomRange = range.min !== minLimit || range.max !== maxLimit;

    return {
        range,
        updateRange,
        clearRange,
        hasCustomRange,
        minLimit,
        maxLimit,
    };
}
