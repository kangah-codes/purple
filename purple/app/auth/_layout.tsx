import { useAuth } from '@/components/Auth/hooks';
import { Redirect, Stack } from 'expo-router';

export default function Auth() {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Redirect href={'/(tabs)'} />;
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
