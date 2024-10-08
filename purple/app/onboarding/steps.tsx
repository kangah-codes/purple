import { useAuth } from '@/components/Auth/hooks';
import OnboardingScreen from '@/components/Onboarding/screens/Onboarding';
import { Redirect, Stack } from 'expo-router';

export default function Screen() {
    const { hasOnboarded } = useAuth();

    if (hasOnboarded) return <Redirect href='/onboarding/landing' />;

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <OnboardingScreen />
        </>
    );
}
