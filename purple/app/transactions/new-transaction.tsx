import NewTransactionScreen from '@/components/Transactions/screens/NewTransactionScreen';
import { useScreenTracking } from '@/lib/providers/Analytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('new_transaction', {
        source: 'navigation',
    });

    return <NewTransactionScreen />;
}
