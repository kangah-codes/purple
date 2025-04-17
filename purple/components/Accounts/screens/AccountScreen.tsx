import { LinearGradient, SafeAreaView, ScrollView } from '@/components/Shared/styled';
import { useInfiniteTransactions } from '@/components/Transactions/hooks';
import { useLocalSearchParams } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useCallback, useEffect, useMemo } from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAccount, useAccountStore } from '../hooks';
import AccountActivityAreaChart from '../molecules/AccountActivityAreaChart';
import AccountInformation from '../molecules/AccountInformation';
import AccountNavigationArea from '../molecules/AccountNavigationArea';
import AccountTransactionsList from '../molecules/AccountTransactionsList';
import LoadingScreen from '../molecules/LoadingScreen';
import { GenericAPIResponse } from '@/@types/request';
import { Account } from '../schema';
import { useRefreshOnFocus } from '@/lib/hooks/refetchOnFocus';
import { useQueryClient } from 'react-query';

const LINEAR_GRADIENT_COLORS = ['#D8B4FE', '#fff'];

function AccountScreen() {
    const { accountID } = useLocalSearchParams<{ accountID: string }>();
    const { setCurrentAccount } = useAccountStore();
    const queryClient = useQueryClient();
    const {
        data: accountData,
        isFetching: accountFetching,
        refetch: accountRefetch,
        isLoading: accountsLoading,
    } = useAccount({
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

    const {
        data: transactionsData,
        fetchNextPage,
        hasNextPage,
        refetch: transactionsRefetch,
        isFetching: transactionsFetching,
        isLoading: transactionsLoading,
    } = useInfiniteTransactions({
        requestQuery: {
            accountID,
            page_size: 10,
        },
        options: {
            onError: (err) => {
                Toast.show({
                    type: 'error',
                    props: {
                        text1: 'Error!',
                        text2: err.message,
                    },
                });
            },
        },
    });

    useRefreshOnFocus(transactionsRefetch);
    useRefreshOnFocus(accountRefetch);

    useEffect(() => {
        return () => {
            queryClient.invalidateQueries([`account-${accountID}`]);
        };
    }, []);

    const transactions = useMemo(() => {
        if (!transactionsData) return [];
        return transactionsData.pages.flatMap((page) => page.data);
    }, [transactionsData]);

    const handleLoadMore = useCallback(() => {
        if (hasNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, fetchNextPage]);

    const isLoading = transactionsLoading || accountsLoading;
    if (isLoading) return <LoadingScreen />;

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
                <AccountInformation transactions={transactions} />
                <AccountActivityAreaChart transactions={transactions} />
                <AccountTransactionsList
                    transactions={transactions}
                    queryData={{
                        handleLoadMore,
                        refetch: transactionsRefetch,
                        refreshing: transactionsFetching,
                    }}
                />
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
