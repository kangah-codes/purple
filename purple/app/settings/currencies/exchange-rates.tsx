import ExchangeRatesScreen from '@/components/Settings/screens/ExchangeRatesScreen';
import { useScreenTracking } from '@/lib/providers/Analytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('exchange_rates', {
        source: 'navigation',
    });

    return <ExchangeRatesScreen />;
}
