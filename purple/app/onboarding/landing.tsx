import Landing from '@/components/Onboarding/screens/Landing';
import { Stack } from 'expo-router';

export default function Screen() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <Landing />
        </>
    );
}
