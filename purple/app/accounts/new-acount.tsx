import NewAccountScreen from '@/components/Accounts/screens/NewAccountScreen';
import { useScreenTracking } from '@/lib/providers/Analytics';
import { Stack } from 'expo-router';
import React from 'react';

export default function Screen() {
    useScreenTracking('new_account', {
        source: 'navigation',
    });

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <NewAccountScreen />
        </>
    );
}
