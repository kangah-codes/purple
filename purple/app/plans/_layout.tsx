import { useAuth } from '@/components/Auth/hooks';
import { Redirect, Stack } from 'expo-router';

export default function Plans() {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Redirect href='/onboarding/landing' />;
    }

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
