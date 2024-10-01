import { GenericAPIResponse } from '@/@types/request';
import { useAccountStore } from '@/components/Accounts/hooks';
import { useAuth } from '@/components/Auth/hooks';
import { SessionData, User } from '@/components/Auth/schema';
import LoadingScreen from '@/components/Index/molecules/LoadingScreen';
import IndexScreen from '@/components/Index/screens/IndexScreen';
import { useUser, useUserStore } from '@/components/Profile/hooks';
import { SafeAreaView, View } from '@/components/Shared/styled';
import { useEffect } from 'react';
import { ActivityIndicator, Button } from 'react-native';
import Toast from 'react-native-toast-message';

export default function Screen() {
    const { sessionData } = useAuth();
    const { user, setUser } = useUserStore();
    const { setAccounts } = useAccountStore();
    const { isLoading, refetch, data } = useUser({
        sessionData: sessionData as SessionData,
        id: sessionData?.user.ID,
        options: {
            onError: () => {
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

    useEffect(() => {
        if (data) {
            setUser(data.data);
            setAccounts(data.data.accounts);
        }
    }, [data]);

    if (isLoading && user == null) {
        return <LoadingScreen />;
    }

    return <IndexScreen />;
}
