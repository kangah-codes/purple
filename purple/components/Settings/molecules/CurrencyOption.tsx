import { Text } from '@/components/Shared/styled';
import { currencies } from '@/lib/constants/currencies';
import React from 'react';

export default function CurrencyOption({ code }: { code: string }) {
    return <Text>{currencies.find((currency) => currency.code === code)?.emojiFlag}</Text>;
}
