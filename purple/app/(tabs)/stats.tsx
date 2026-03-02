import IndexScreen from '@/components/Stats/screens/IndexScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function StatsScreen() {
    useScreenTracking('stats', {
        source: 'navigation',
    });
    return <IndexScreen />;
}
