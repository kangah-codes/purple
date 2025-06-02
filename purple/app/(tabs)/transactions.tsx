import TransactionsScreen from '@/components/Transactions/screens/TransactionsScreen';
import { useScreenTracking } from '@/lib/providers/Analytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('transactions', {
        source: 'navigation',
    });
    return <TransactionsScreen />;
}
