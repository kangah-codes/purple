import { useAccountStore } from '@/components/Accounts/hooks';
import EditAccountScreen from '@/components/Accounts/screens/EditAccountScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import { Stack } from 'expo-router';
import React from 'react';

export default function Screen() {
    const { currentAccount } = useAccountStore();
    useScreenTracking('edit_account', {
        source: 'navigation',
        account_id: currentAccount?.id ?? null,
    });

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <EditAccountScreen />
        </>
    );
}
