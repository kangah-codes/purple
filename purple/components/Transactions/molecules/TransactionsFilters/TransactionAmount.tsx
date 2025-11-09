import React, { useState } from 'react';
import { View } from '@/components/Shared/styled';
import RangeSlider from '@/components/Shared/molecules/RangeSlider';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { usePreferences } from '@/components/Settings/hooks';

interface TransactionAmountFilterProps {
    onRangeChange?: (minAmount: number, maxAmount: number) => void;
    minLimit?: number;
    maxLimit?: number;
    step?: number;
    initialMin?: number;
    initialMax?: number;
}

export default function TransactionAmountFilter({
    onRangeChange,
    minLimit = 0,
    maxLimit = 10000,
    step = 10,
    initialMin,
    initialMax,
}: TransactionAmountFilterProps) {
    const [selectedMin, setSelectedMin] = useState(initialMin ?? minLimit);
    const [selectedMax, setSelectedMax] = useState(initialMax ?? maxLimit);
    const {
        preferences: { currency },
    } = usePreferences();

    const formatCurrency = (value: number) => {
        return formatCurrencyRounded(value, currency);
    };

    const handleRangeChange = (min: number, max: number) => {
        setSelectedMin(min);
        setSelectedMax(max);
        onRangeChange?.(min, max);
    };

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
