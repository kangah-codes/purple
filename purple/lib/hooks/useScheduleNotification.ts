import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { usePreferences } from '@/components/Settings/hooks';

export function useScheduleNotification() {
    const {
        preferences: { pushNotificationsEnabled },
    } = usePreferences();

    useEffect(() => {
        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }
    }, [pushNotificationsEnabled]);

    const scheduleNotification = useCallback(
        async (
            content: Omit<Notifications.NotificationContentInput, 'channelId'>,
            trigger: Notifications.NotificationTriggerInput,
        ) => {
            if (!pushNotificationsEnabled) return;
            return Notifications.scheduleNotificationAsync({
                content: { ...content },
                trigger,
            });
        },
        [],
    );

    return { scheduleNotification };
}
