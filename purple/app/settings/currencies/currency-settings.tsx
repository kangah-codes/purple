import CurrencyScreen from '@/components/Settings/screens/CurrencyScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('currency_settings', {
        source: 'navigation',
    });

    return <CurrencyScreen />;
}
