import OTPScreen from '@/components/Auth/screens/OTPScreen';
import { Stack } from 'expo-router';
import React from 'react';

export default function Screen() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <OTPScreen />
        </>
    );
}
