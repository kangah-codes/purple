import { useAuth } from '@/components/Auth/hooks';
import IndexScreen from '@/components/Index/screens/IndexScreen';
import { SafeAreaView, View } from '@/components/Shared/styled';
import { ActivityIndicator } from 'react-native';

export default function Screen() {
    const { sessionData } = useAuth();

    const loading = false;

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

    return <IndexScreen />;
}
