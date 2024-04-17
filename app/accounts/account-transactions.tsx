import NewAccountScreen from '@/components/Accounts/screens/NewAccountScreen';
import TransactionsScreen from '@/components/Transactions/screens/TransactionsScreen';
import { Stack } from 'expo-router';

export default function Screen() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false, presentation: 'transparentModal' }} />
            <TransactionsScreen showBackButton />
        </>
    );
}
