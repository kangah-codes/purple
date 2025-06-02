import PlansScreen from '@/components/Plans/screens/PlansScreen';
import { useScreenTracking } from '@/lib/providers/Analytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('plans', {
        source: 'navigation',
    });
    return <PlansScreen />;
}
