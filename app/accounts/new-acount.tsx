import NewAccountScreen from '@/components/Accounts/screens/NewAccountScreen';
import { Stack } from 'expo-router';

export default function Screen() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <NewAccountScreen />
        </>
    );
}
