import ExchangeRatesScreen from '@/components/Settings/screens/ExchangeRatesScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('exchange_rates', {
        source: 'navigation',
    });

    return <ExchangeRatesScreen />;
}
