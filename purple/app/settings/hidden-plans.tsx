import HiddenPlansScreen from '@/components/Settings/screens/HiddenPlansScreen';
import { useScreenTracking } from '@/lib/providers/Analytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('hidden_plans', {
        source: 'navigation',
    });

    return <HiddenPlansScreen />;
}
