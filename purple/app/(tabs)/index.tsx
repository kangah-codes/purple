import { GenericAPIResponse } from '@/@types/request';
import { useAccountStore } from '@/components/Accounts/hooks';
import { useAuth } from '@/components/Auth/hooks';
import { SessionData, User } from '@/components/Auth/schema';
import LoadingScreen from '@/components/Index/molecules/LoadingScreen';
import IndexScreen from '@/components/Index/screens/IndexScreen';
import { usePlanStore } from '@/components/Plans/hooks';
import { useUser, useUserStore } from '@/components/Profile/hooks';
import { useTransactionStore } from '@/components/Transactions/hooks';
import Toast from 'react-native-toast-message';

export default function Screen() {
    const { sessionData } = useAuth();
    const { user, setUser } = useUserStore();
    const { setAccounts, accounts } = useAccountStore();
    const { setTransactions, updateTransactions } = useTransactionStore();
    const { setPlans } = usePlanStore();
    const { isLoading, isFetching, error } = useUser({
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
                updateTransactions(res.data.transactions);
                setPlans(res.data.plans);
            },
        },
    });

    if (isLoading || user == null) {
        return <LoadingScreen />;
    }

    return <IndexScreen />;
}
