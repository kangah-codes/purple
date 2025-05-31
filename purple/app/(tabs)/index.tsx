import { GenericAPIResponse } from '@/@types/request';
import { useAccountStore } from '@/components/Accounts/hooks';
import { useAuth } from '@/components/Auth/hooks';
import { User } from '@/components/Auth/schema';
import LoadingScreen from '@/components/Index/molecules/LoadingScreen';
import IndexScreen from '@/components/Index/screens/IndexScreen';
import { usePlanStore } from '@/components/Plans/hooks';
import { useUser, useUserStore } from '@/components/Profile/hooks';
import { useTransactionStore } from '@/components/Transactions/hooks';
import { useScreenTracking } from '@/lib/providers/Analytics';
import { nativeStorage } from '@/lib/utils/storage';
import React from 'react';
import Toast from 'react-native-toast-message';

export default function Screen() {
    const { sessionData } = useAuth();
    const { user, setUser } = useUserStore();
    const { setAccounts } = useAccountStore();
    const { updateTransactions } = useTransactionStore();
    const { setPlans } = usePlanStore();
    const { isLoading } = useUser({
        options: {
            onError: (err) => {
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

    console.log(nativeStorage.getItem('analytics-data'));

    useScreenTracking('home', {
        source: 'navigation',
    });

    if (isLoading || user == null) {
        return <LoadingScreen />;
    }

    return <IndexScreen />;
}
