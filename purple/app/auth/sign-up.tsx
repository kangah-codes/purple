import SignUpScreen from '@/components/Auth/screens/SignUpScreen';
import { Stack } from 'expo-router';

export default function Screen() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SignUpScreen />
        </>
    );
}
