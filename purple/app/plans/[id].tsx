import PlanScreen from '@/components/Plans/screens/PlanScreen';
import { useScreenTracking } from '@/lib/providers/Analytics';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function Screen() {
    const { id } = useLocalSearchParams();

    useScreenTracking('plan', {
        source: 'navigation',
        id,
    });

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <PlanScreen />
        </>
    );
}
