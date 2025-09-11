import NotificationsScreen from '@/components/Settings/screens/NotificationsScreen';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import React from 'react';

export default function Screen() {
    useScreenTracking('notification_settings', {
        source: 'navigation',
    });

    return <NotificationsScreen />;
}
