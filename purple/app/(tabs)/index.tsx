import { GenericAPIResponse } from '@/@types/request';
import { useAccountStore } from '@/components/Accounts/hooks';
import { useAuth } from '@/components/Auth/hooks';
import { SessionData, User } from '@/components/Auth/schema';
import IndexScreen from '@/components/Index/screens/IndexScreen';
import { useUser, useUserStore } from '@/components/Profile/hooks';
import { SafeAreaView, View } from '@/components/Shared/styled';
import { useTransactionStore } from '@/components/Transactions/hooks';
import { useEffect } from 'react';
import { ActivityIndicator, Button } from 'react-native';
import Toast from 'react-native-toast-message';

export default function Screen() {
    const { sessionData } = useAuth();
    const { user, setUser } = useUserStore();
    const { setAccounts } = useAccountStore();
    const { setTransactions } = useTransactionStore();
    const { isLoading, data } = useUser({
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

    console.log(data);

    useEffect(() => {
        if (data) {
            setUser(data.data);
            setAccounts(data.data.accounts);
            setTransactions(data.data.transactions);
        }
    }, [data]);

    if (isLoading && user == null) {
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
