import { useAuth } from '@/components/Auth/hooks';
import { Redirect, Stack } from 'expo-router';

export default function Onboarding() {
    const { isAuthenticated, hasOnboarded } = useAuth();

    console.log('Onboarding is authenticated', isAuthenticated);
    console.log('Onboarding has onboarded', hasOnboarded);

    if (isAuthenticated) return <Redirect href={'/(tabs)'} />;

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
