import SignInScreen from '@/components/Auth/screens/SignInScreen';
import { Stack } from 'expo-router';
import React from 'react';

export default function Screen() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SignInScreen />
        </>
    );
}
