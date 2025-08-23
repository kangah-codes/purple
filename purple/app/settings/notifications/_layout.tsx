import { Stack } from 'expo-router';
import React from 'react';

export default function Settings() {
    return (
        <Stack
            screenOptions={{
                contentStyle: {
                    backgroundColor: '#fff',
                },
                headerShown: false,
            }}
        />
    );
}
