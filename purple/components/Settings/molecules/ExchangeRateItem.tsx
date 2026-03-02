import FlagIcon from '@/components/Shared/atoms/FlagIcon';
import { Text, View } from '@/components/Shared/styled';
import { currencies } from '@/lib/constants/currencies';
import { satoshiFont } from '@/lib/constants/fonts';
import CurrencyService from '@/lib/services/CurrencyService';
import { formatCurrencyAccurate, formatCurrencyRounded } from '@/lib/utils/number';
import React, { useCallback } from 'react';

export type CurrencyCode = Lowercase<(typeof currencies)[number]['code']>;
type CurrencySelectProps = {
    currency: (typeof currencies)[number];
    selectedCurrency: string;
};
const currencyService = CurrencyService.getInstance();

export default function ExchangeRateItem({ currency, selectedCurrency }: CurrencySelectProps) {
    const calculateCurrency = useCallback(
        (currencyCode: string) => {
            return currencyService.convertCurrencySync({
                from: { currency: selectedCurrency.toLowerCase() as CurrencyCode, amount: 1 },
                to: { currency: currencyCode.toLowerCase() as CurrencyCode },
            });
        },
        [selectedCurrency],
    );

    return (
        <View className='py-3 flex flex-row space-x-2 items-center justify-between'>
            <View className='flex flex-row space-x-2'>
                <View className='w-[40] h-[40] flex items-center justify-center'>
                    <FlagIcon currency={currency} />
                </View>
                <View className='flex flex-col'>
                    <Text style={satoshiFont.satoshiBold} className='text-base'>
                        {currency.code}
                    </Text>
                    <Text style={satoshiFont.satoshiMedium} className='text-sm text-gray-500'>
                        {currency.country}
                    </Text>
                </View>
            </View>

            <Text style={satoshiFont.satoshiBold} className='text-sm'>
                {formatCurrencyAccurate(selectedCurrency, 1)} ≈{' '}
                {formatCurrencyRounded(
                    Number(calculateCurrency(currency.code).toFixed(2)),
                    currency.code,
                )}
            </Text>
        </View>
    );
}
