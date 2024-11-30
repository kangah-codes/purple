import ExpenseScreen from '@/components/Plans/screens/ExpenseScreen';
import { Stack } from 'expo-router';
import React from 'react';

export default function Screen() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <ExpenseScreen />
        </>
    );
}
