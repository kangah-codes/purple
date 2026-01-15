import FeatureFlagsScreen from '@/components/Settings/screens/FeatureFlagsScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function FeatureFlags() {
    useScreenTracking('feature_flags', {
        section: 'settings',
    });

    return <FeatureFlagsScreen />;
}
