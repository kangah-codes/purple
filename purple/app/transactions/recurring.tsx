import RecurringTransactionsScreen from '@/components/Transactions/screens/RecurringTransactionsScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('recurring_transactions', {
        source: 'navigation',
    });
    return <RecurringTransactionsScreen />;
}
