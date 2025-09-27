import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { usePreferences } from '@/components/Settings/hooks';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export function useNotifications() {
    const {
        preferences: { pushNotificationsEnabled, dailyNotificationsEnabled },
    } = usePreferences();
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();

    useEffect(() => {
        if (!pushNotificationsEnabled || dailyNotificationsEnabled) {
            Notifications.cancelAllScheduledNotificationsAsync();
            setExpoPushToken(null);
            setNotification(null);
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
                notificationListener.current = undefined;
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
                responseListener.current = undefined;
            }
            return;
        }

        registerForPushNotificationsAsync().then((token) => token && setExpoPushToken(token));

        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        notificationListener.current = Notifications.addNotificationReceivedListener((n) => {
            setNotification(n);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                console.log('Notification response:', response);
            },
        );

        scheduleDailyNotification();

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
                notificationListener.current = undefined;
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
                responseListener.current = undefined;
            }
        };
    }, [pushNotificationsEnabled, dailyNotificationsEnabled]);

    async function scheduleDailyNotification() {
        if (!pushNotificationsEnabled || !dailyNotificationsEnabled) return;
        try {
            const existing = await Notifications.getAllScheduledNotificationsAsync();
            const alreadyScheduled = existing.some((n) => n.content.data.dailyReminder === true);

            if (alreadyScheduled) {
                console.log('Daily notification already scheduled, skipping.');
                return;
            }

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Checking in!',
                    body: 'Did you log your transactions today?',
                    sound: true,
                    data: { dailyReminder: true },
                },
                trigger: {
                    hour: 17,
                    repeats: true,
                },
            });
        } catch (e) {
            console.error('Failed to schedule daily notification:', e);
        }
    }

    return { expoPushToken, notification, scheduleDailyNotification };
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Device.isDevice) {
        return null;
    }

    let finalStatus: string;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        alert('Failed to get notification permissions!');
        return null;
    }

    try {
        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) throw new Error('Project ID not found for Expo push token');

        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        return token;
    } catch (e) {
        console.error('Error getting Expo push token:', e);
        return null;
    }
}
