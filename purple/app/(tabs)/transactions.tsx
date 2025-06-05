import TransactionsScreen from '@/components/Transactions/screens/TransactionsScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('transactions', {
        source: 'navigation',
    });
    return <TransactionsScreen />;
}
