import { useAuth } from '@/components/Auth/hooks';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function NewTransactions() {
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
