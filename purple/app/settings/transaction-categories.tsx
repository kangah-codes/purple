import CategoriesScreen from '@/components/Settings/screens/CategoriesScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('transaction_categories', {
        source: 'navigation',
    });
    return <CategoriesScreen />;
}
