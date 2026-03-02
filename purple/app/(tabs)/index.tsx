import IndexScreen from '@/components/Index/screens/IndexScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('home', {
        source: 'navigation',
    });

    return <IndexScreen />;
}
