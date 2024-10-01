import { useAuth } from '@/components/Auth/hooks';
import Landing from '@/components/Onboarding/screens/Landing';
import { Redirect, Stack } from 'expo-router';

export default function Screen() {
    const { hasOnboarded } = useAuth();

    if (!hasOnboarded) return <Redirect href='/onboarding/steps' />;

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <Landing />
        </>
    );
}
