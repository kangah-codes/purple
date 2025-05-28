import Checkbox from '@/components/Shared/atoms/Checkbox';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { currencies } from '@/lib/constants/currencies';
import { satoshiFont } from '@/lib/constants/fonts';
import { Image } from 'expo-image';
import React from 'react';

type CurrencySelectProps = {
    currency: (typeof currencies)[number];
    selectedCurrency: string;
    callback: () => void;
};

export default function CurrencySelect({
    callback,
    currency,
    selectedCurrency,
}: CurrencySelectProps) {
    const isChecked = currency.code === selectedCurrency;

    return (
        <TouchableOpacity
            onPress={callback}
            className='py-3 border-b border-purple-100 flex flex-row space-x-2 items-center justify-between'
        >
            <View className='flex flex-row space-x-2'>
                <View className='w-[40] h-[40] flex items-center justify-center'>
                    <Image
                        style={{
                            width: 37,
                            height: 37,
                            borderRadius: 40,
                        }}
                        source={{
                            uri: `https://globalartinc.github.io/round-flags/flags/${currency.locale.split('-')[1].toLowerCase()}.svg`,
                        }}
                        contentFit='cover'
                        transition={500}
                    />
                </View>
                <View className='flex flex-col'>
                    <Text style={satoshiFont.satoshiBold} className='text-base'>
                        {currency.name} ({currency.symbol})
                    </Text>
                    <Text style={satoshiFont.satoshiMedium} className='text-sm text-gray-500'>
                        {currency.country}
                    </Text>
                </View>
            </View>

            <Checkbox checked={isChecked} onChange={callback} />
        </TouchableOpacity>
    );
}
