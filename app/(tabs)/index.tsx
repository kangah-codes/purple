import IndexScreen from '@/components/Index/screens/IndexScreen';
import useHasOnboarded from '@/lib/db/db';
import { Redirect } from 'expo-router';
import { SafeAreaView, View } from '@/components/Shared/styled';
import { ActivityIndicator } from 'react-native';

export default function Screen() {
    const { hasOnboarded, loading } = useHasOnboarded();

    if (loading) {
        return (
            <SafeAreaView className='w-full items-center justify-items-center flex flex-1'>
                <View className='h-full flex items-center w-full justify-items-center flex-row'>
                    <View className='w-full'>
                        <ActivityIndicator />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    if (!hasOnboarded) {
        return <Redirect href='/onboarding/' />;
    }

    return <IndexScreen />;
}
