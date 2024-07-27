import { Stack } from 'expo-router';

export default function Auth() {
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
