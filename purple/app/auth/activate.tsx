import OTPAccountActivationScreen from '@/components/Auth/screens/OTPAccountActivationScreen';
import SignUpScreen from '@/components/Auth/screens/SignUpScreen';
import { Stack } from 'expo-router';
import React from 'react';

export default function Screen() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <OTPAccountActivationScreen />
        </>
    );
}
