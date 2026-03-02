import NewTransactionScreenAlternate from '@/components/Transactions/screens/NewTransactionScreenAlternate';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('new_transaction', {
        source: 'navigation',
    });

    return <NewTransactionScreenAlternate />;
}
