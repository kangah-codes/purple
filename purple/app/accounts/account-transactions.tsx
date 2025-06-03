import AccountScreen from '@/components/Accounts/screens/AccountScreen';
import { useScreenTracking } from '@/lib/providers/Analytics';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function Screen() {
    const { accountID } = useLocalSearchParams<{ accountID: string }>();
    useScreenTracking('account', {
        source: 'navigation',
        id: accountID,
    });

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <AccountScreen />
        </>
    );
}
