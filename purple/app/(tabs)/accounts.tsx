import AccountsScreen from '@/components/Accounts/screens/IndexScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('accounts', {
        source: 'navigation',
    });
    return <AccountsScreen />;
}
