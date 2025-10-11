import EditRecurringTransactionScreen from '@/components/Transactions/screens/EditRecurringTransactionScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('edit_recurring_transaction', {
        source: 'navigation',
    });

    return <EditRecurringTransactionScreen />;
}
