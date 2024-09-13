import { useAuth } from '@/components/Auth/hooks';
import { SessionData } from '@/components/Auth/schema';
import IndexScreen from '@/components/Index/screens/IndexScreen';
import { useUser } from '@/components/Profile/hooks';
import { SafeAreaView, View } from '@/components/Shared/styled';
import { ActivityIndicator } from 'react-native';

export default function Screen() {
    const { sessionData } = useAuth();

    const { isLoading } = useUser({
        sessionData: sessionData as SessionData,
        id: sessionData?.user.ID,
    });

    if (isLoading) {
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
