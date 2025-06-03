import AccountsScreen from '@/components/Accounts/screens/IndexScreen';
import { useScreenTracking } from '@/lib/providers/Analytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('accounts', {
        source: 'navigation',
    });
    return <AccountsScreen />;
}
