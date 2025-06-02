import IndexScreen from '@/components/Stats/screens/IndexScreen';
import { useScreenTracking } from '@/lib/providers/Analytics';
import React from 'react';

export default function StatsScreen() {
    useScreenTracking('stats', {
        source: 'navigation',
    });
    return <IndexScreen />;
}
