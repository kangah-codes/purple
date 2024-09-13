import { useAuth } from '@/components/Auth/hooks';
import { SessionData } from '@/components/Auth/schema';
import IndexScreen from '@/components/Index/screens/IndexScreen';
import { useUser, useUserStore } from '@/components/Profile/hooks';
import { SafeAreaView, View } from '@/components/Shared/styled';
import { ActivityIndicator, Button } from 'react-native';
import Toast from 'react-native-toast-message';

export default function Screen() {
    const { sessionData } = useAuth();
    const { user, setUser } = useUserStore();

    console.log(sessionData?.user.ID, 'USER ID');

    const { isLoading, refetch } = useUser({
        sessionData: sessionData as SessionData,
        id: sessionData?.user.ID,
        options: {
            onSuccess: (data) => {
                console.log('User data:', data);
                alert(`User data: ${JSON.stringify(data)}`);
            },
            onError: (error) => {
                console.error('Error fetching user data:', error);
                alert(
                    `Error fetching user data: ${JSON.stringify(error)} ${JSON.stringify(
                        sessionData,
                    )}`,
                );
                Toast.show({
                    type: 'error',
                    props: {
                        text1: 'Error!',
                        text2: 'Something went wrong',
                    },
                });
            },
        },
    });

    // if (isLoading && user == null) {
    //     return (
    //         <SafeAreaView className='w-full items-center justify-items-center flex flex-1'>
    //             <View className='h-full flex items-center w-full justify-items-center flex-row'>
    //                 <View className='w-full'>
    //                     <ActivityIndicator />
    //                 </View>
    //             </View>
    //         </SafeAreaView>
    //     );
    // }

    return (
        <View>
            <Button title='Refetch' onPress={() => refetch()} />
            <IndexScreen />
        </View>
    );
}
