import AccountsScreen from '@/components/Settings/screens/AccountsScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('account_settings', {
        source: 'navigation',
    });

    return <AccountsScreen />;
}
