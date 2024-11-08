import AccountScreen from '@/components/Accounts/screens/AccountScreen';
import TransactionsScreen from '@/components/Transactions/screens/TransactionsScreen';
import { Stack } from 'expo-router';
import React from 'react';

export default function Screen() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
            <AccountScreen showBackButton />
        </>
    );
}
