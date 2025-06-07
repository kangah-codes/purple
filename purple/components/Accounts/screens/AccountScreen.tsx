import { GenericAPIResponse } from '@/@types/request';
import { LinearGradient, SafeAreaView, ScrollView } from '@/components/Shared/styled';
import TransactionsAccordion from '@/components/Stats/molecules/TransactionAccordion';
import { useTransactions } from '@/components/Transactions/hooks';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import { getDateRange } from '@/lib/utils/date';
import { useLocalSearchParams } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useEffect } from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAccount, useAccountStore } from '../hooks';
import AccountActivityAreaChart from '../molecules/AccountActivityAreaChart';
import AccountInformation from '../molecules/AccountInformation';
import AccountNavigationArea from '../molecules/AccountNavigationArea';
import LoadingScreen from '../molecules/LoadingScreen';
import { Account } from '../schema';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';

const LINEAR_GRADIENT_COLORS = ['#D8B4FE', '#fff'];

function AccountScreen() {
    const { accountID } = useLocalSearchParams<{ accountID: string }>();
    const {
        setCurrentAccount,
        currentAccount,
        currentAccountRequestParams,
        setCurrentAccountRequestParams,
    } = useAccountStore();
    const [initialLoadComplete, setInitialLoadComplete] = React.useState(false);
    useEffect(() => {
        const defaultDateRange = getDateRange('1W');
        setCurrentAccountRequestParams({
            accountID,
            page_size: Infinity,
            currentSelection: '1W',
            startDate: defaultDateRange.startDate.toISOString(),
            endDate: defaultDateRange.endDate.toISOString(),
        });
    }, [accountID]);
    useScreenTracking('account', {
        source: 'navigation',
        account: currentAccount,
    });

    const { refetch: accountRefetch, isLoading: accountsLoading } = useAccount({
        accountID,
        options: {
            onSuccess: (data) => {
                setCurrentAccount((data as GenericAPIResponse<Account>).data);
            },
            onError: () => {
                Toast.show({
                    type: 'error',
                    props: {
                        text1: 'Error!',
                        text2: 'Error fetching account details',
                    },
                });
            },
        },
    });

    useEffect(() => {
        if (currentAccountRequestParams.startDate && currentAccountRequestParams.endDate) {
            transactionsRefetch();
        }
    }, [currentAccountRequestParams.startDate, currentAccountRequestParams.endDate]);

    const {
        data: transactions,
        isLoading: transactionsLoading,
        refetch: transactionsRefetch,
    } = useTransactions({
        requestQuery: {
            accountID,
            start_date: currentAccountRequestParams.startDate,
            end_date: currentAccountRequestParams.endDate,
            page_size: currentAccountRequestParams.page_size,
        },
        options: {
            onError: () => {
                Toast.show({
                    type: 'error',
                    props: {
                        text1: 'Error!',
                        text2: "Couldn't fetch account details",
                    },
                });
            },
        },
    });
    useRefreshOnFocus(transactionsRefetch);
    useRefreshOnFocus(accountRefetch);
    useEffect(() => {
        setCurrentAccountRequestParams({
            accountID,
            page_size: Infinity,
        });
    }, []);
    useEffect(() => {
        if (!accountsLoading && !transactionsLoading && !initialLoadComplete) {
            setInitialLoadComplete(true);
        }
    }, [accountsLoading, transactionsLoading, initialLoadComplete]);

    if (!initialLoadComplete) {
        return <LoadingScreen />;
    }

    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <LinearGradient
                className='flex px-5 py-2.5 h-[350] absolute w-full'
                colors={LINEAR_GRADIENT_COLORS}
                style={styles.parentView}
            />
            <ExpoStatusBar style='dark' />
            <ScrollView>
                <AccountNavigationArea />
                <AccountInformation transactions={transactions?.data ?? []} />
                <AccountActivityAreaChart transactions={transactions?.data ?? []} />
                <TransactionsAccordion transactions={transactions?.data ?? []} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});

export default AccountScreen;
