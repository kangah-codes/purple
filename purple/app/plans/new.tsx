import NewPlanScreen from '@/components/Plans/screens/_NewPlanScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('new_plan', {
        source: 'navigation',
    });

    return <NewPlanScreen />;
}
