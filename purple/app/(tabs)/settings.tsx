import React from 'react';
import SettingsScreen from '@/components/Settings/screens/SettingsScreen';
import { useScreenTracking } from '@/lib/providers/Analytics';

export default function Screen() {
    useScreenTracking('settings', {
        source: 'navigation',
    });
    return <SettingsScreen />;
}
