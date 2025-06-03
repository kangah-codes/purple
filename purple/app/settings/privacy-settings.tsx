import PrivacyScreen from '@/components/Settings/screens/PrivacyScreen';
import { useScreenTracking } from '@/lib/providers/Analytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('privacy_settings', {
        source: 'navigation',
    });
    return <PrivacyScreen />;
}
