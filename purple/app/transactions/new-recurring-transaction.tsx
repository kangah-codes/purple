import NewRecurringTransactionScreen from '@/components/Transactions/screens/NewRecurringTransactionScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('new_transaction', {
        source: 'navigation',
    });

    return <NewRecurringTransactionScreen />;
}
