import IndexScreen from '@/components/Transactions/screens/IndexScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('transactions', {
        source: 'navigation',
    });
    return <IndexScreen />;
}
