import React from 'react';
import SettingsScreen from '@/components/Settings/screens/SettingsScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';

export default function Screen() {
    useScreenTracking('settings', {
        source: 'navigation',
    });
    return <SettingsScreen />;
}
