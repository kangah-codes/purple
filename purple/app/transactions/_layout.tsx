import { Stack } from 'expo-router';

export default function Transactions() {
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
