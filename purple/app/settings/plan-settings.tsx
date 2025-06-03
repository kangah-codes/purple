import PlansScreen from '@/components/Settings/screens/PlansScreen';
import { useScreenTracking } from '@/lib/providers/Analytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('plan_settings', {
        source: 'navigation',
    });

    return <PlansScreen />;
}
