import EditTransactionScreen from '@/components/Transactions/screens/EditTransactionScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('edit_transaction', {
        source: 'navigation',
    });

    return <EditTransactionScreen />;
}
