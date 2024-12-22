import PlanScreen from '@/components/Plans/screens/PlanScreen';
import { Stack } from 'expo-router';
import React from 'react';

export default function Screen() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <PlanScreen />
        </>
    );
}
