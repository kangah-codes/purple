import { LinearGradient, SafeAreaView, ScrollView } from '@/components/Shared/styled';
import { useInfiniteTransactions } from '@/components/Transactions/hooks';
import { Transaction } from '@/components/Transactions/schema';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAccount, useAccountStore } from '../hooks';
import AccountActivityAreaChart from '../molecules/AccountActivityAreaChart';
import AccountInformation from '../molecules/AccountInformation';
import AccountNavigationArea from '../molecules/AccountNavigationArea';
import AccountTransactionsList from '../molecules/AccountTransactionsList';
import { Account } from '../schema';

const linearGradientColours = ['#D8B4FE', '#fff'];

type AccountScreenProps = {
    showBackButton?: boolean;
};

function AccountScreen(props: AccountScreenProps) {
    const { accountID }: { accountID: string } = useLocalSearchParams();
    const { currentAccount, setCurrentAccount } = useAccountStore();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const {
        data: dataAccount,
        isLoading: accountLoading,
        isFetching: accountFetching,
        refetch: accountRefetch,
    } = useAccount({
        accountID,
        options: {
            cacheTime: 0,
            staleTime: 0,
            refetchOnMount: true,
            refetchOnWindowFocus: true,
            onError: () => {
                Toast.show({
                    type: 'error',
                    props: {
                        text1: 'Error!',
                        text2: 'Error fetching account details',
                    },
                });
            },
            onSuccess: (data) => {},
        },
    });
    const {
        data: dataTransactions,
        fetchNextPage,
        hasNextPage,
        isLoading: transactionsLoading,
        refetch,
        isFetching: transactionsFetching,
    } = useInfiniteTransactions({
        requestQuery: {
            accountID,
            page_size: 10,
        },
        options: {
            cacheTime: 0,
            staleTime: 0,
            refetchOnMount: true,
            refetchOnWindowFocus: true,
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

    const handleLoadMore = () => {
        if (hasNextPage) {
            fetchNextPage();
        }
    };

    // TODO: look for better way to refetch on focus
    useFocusEffect(
        useCallback(() => {
            if (currentAccount?.id) {
                accountRefetch();
                refetch();
            }
        }, [currentAccount?.id, accountRefetch, refetch]),
    );

    useEffect(() => {
        if (dataAccount) {
            // may the ts gods forgive me
            setCurrentAccount(dataAccount.data as unknown as Account);
        }

        return () => {
            setCurrentAccount(null);
        };
    }, [dataAccount]);

    // flatten the data
    useEffect(() => {
        if (dataTransactions) {
            const tx = dataTransactions.pages.flatMap((page) => page.data);
            setTransactions(tx);
        }
    }, [dataTransactions]);

    // if (transactionsFetching || accountFetching || !currentAccount) return <LoadingScreen />;
    if (!currentAccount && (!transactionsFetching || !accountFetching)) return null;

    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <LinearGradient
                className='flex px-5 py-2.5 h-[350] absolute w-full'
                colors={linearGradientColours}
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
                        refetch,
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
