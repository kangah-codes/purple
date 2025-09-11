import ExperimentalSettingsScreen from '@/components/Settings/screens/ExperimentalSettingsScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('experimental_settings', {
        source: 'navigation',
    });

    return <ExperimentalSettingsScreen />;
}
