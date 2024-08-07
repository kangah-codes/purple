import OTPScreen from '@/components/Auth/screens/OTPScreen';
import { Stack } from 'expo-router';

export default function Screen() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <OTPScreen />
        </>
    );
}
