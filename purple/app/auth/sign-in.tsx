import NewAccountScreen from '@/components/Accounts/screens/NewAccountScreen';
import SignInScreen from '@/components/Auth/screens/SignInScreen';
import { Stack } from 'expo-router';

export default function Screen() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SignInScreen />
        </>
    );
}
