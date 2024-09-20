import { GenericAPIResponse } from '@/@types/request';
import { useAccountStore } from '@/components/Accounts/hooks';
import { useAuth } from '@/components/Auth/hooks';
import { SessionData, User } from '@/components/Auth/schema';
import IndexScreen from '@/components/Index/screens/IndexScreen';
import { usePlanStore } from '@/components/Plans/hooks';
import { useUser, useUserStore } from '@/components/Profile/hooks';
import { SafeAreaView, View } from '@/components/Shared/styled';
import { useTransactionStore } from '@/components/Transactions/hooks';
import { updateArrayWithUniqueItems } from '@/lib/utils/object';
import { useEffect } from 'react';
import { ActivityIndicator, Button } from 'react-native';
import Toast from 'react-native-toast-message';

export default function Screen() {
    const { sessionData } = useAuth();
    const { user, setUser } = useUserStore();
    const { setAccounts, accounts } = useAccountStore();
    const { setTransactions, transactions } = useTransactionStore();
    const { setPlans } = usePlanStore();
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
            onSuccess: (data) => {
                const res = data as GenericAPIResponse<User>;
                setUser(res.data);
                setAccounts(res.data.accounts);
                // TODO: this causes a bug where refreshes on the home screen set the
                // total transactions on the transactions page to 5, until refreshed
                // not a huge priority as it can be fixed by refreshing.
                // leaving this to future Joshua or any other maintainer :)
                setTransactions(res.data.transactions);
                setPlans(res.data.plans);
            },
        },
    });

    useEffect(() => {
        console.log(user, 'User on mount');
    }, []);

    if (isLoading || accounts.length == 0) {
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
