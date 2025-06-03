import NewPlanTransactionScreen from '@/components/Plans/screens/NewPlanTransaction';
import { useScreenTracking } from '@/lib/providers/Analytics';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function Screen() {
    const { id } = useLocalSearchParams();

    useScreenTracking('plan_transaction', {
        source: 'navigation',
        id,
    });

    return <NewPlanTransactionScreen />;
}
