import AccountsScreen from '@/components/Settings/screens/AccountsScreen';
import { useScreenTracking } from '@/lib/providers/Analytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('account_settings', {
        source: 'navigation',
    });

    return <AccountsScreen />;
}
