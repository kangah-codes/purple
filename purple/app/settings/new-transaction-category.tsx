import NewCategoryScreen from '@/components/Settings/screens/NewCategoryScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('new_category', {
        source: 'navigation',
    });
    return <NewCategoryScreen />;
}
