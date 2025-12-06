import CategoryAllocationScreen from '@/components/Plans/screens/CategoryAllocationScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('new_plan_category_allocation', {
        source: 'navigation',
    });

    return <CategoryAllocationScreen />;
}
