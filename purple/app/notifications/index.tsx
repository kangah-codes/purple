import NotificationsScreen from '@/components/Notifications/screens/NotificationsScreen';
import { Stack } from 'expo-router';
import React from 'react';

export default function Screen() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <NotificationsScreen />
        </>
    );
}
