import RecurringTransactionsScreen from '@/components/Settings/screens/RecurringTransactionsScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('transaction_settings', {
        source: 'navigation',
    });

    return <RecurringTransactionsScreen />;
}
