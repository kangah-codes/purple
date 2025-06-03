import NewPlanScreen from '@/components/Plans/screens/NewPlanScreen';
import { useScreenTracking } from '@/lib/providers/Analytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('new_plan', {
        source: 'navigation',
    });

    return <NewPlanScreen />;
}
