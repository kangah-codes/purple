import { useAuth } from '@/components/Auth/hooks';
import { SessionData } from '@/components/Auth/schema';
import { LinearGradient, SafeAreaView, ScrollView } from '@/components/Shared/styled';
import { useInfiniteTransactions } from '@/components/Transactions/hooks';
import { Transaction } from '@/components/Transactions/schema';
import { useLocalSearchParams } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useEffect, useState } from 'react';
import { Platform, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAccountStore } from '../hooks';
import AccountActivityAreaChart from '../molecules/AccountActivityAreaChart';
import AccountInformation from '../molecules/AccountInformation';
import AccountNavigationArea from '../molecules/AccountNavigationArea';
import AccountTransactionsList from '../molecules/AccountTransactionsList';
import LoadingScreen from '../molecules/LoadingScreen';

const linearGradientColours = ['#D8B4FE', '#fff'];

type AccountScreenProps = {
    showBackButton?: boolean;
};

function AccountScreen(props: AccountScreenProps) {
    const { sessionData } = useAuth();
    const { accountID } = useLocalSearchParams();
    const { currentAccount } = useAccountStore();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const { data, fetchNextPage, hasNextPage, isLoading, refetch, isFetching } =
        useInfiniteTransactions({
            sessionData: sessionData as SessionData,
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

    const handleLoadMore = () => {
        if (hasNextPage) {
            fetchNextPage();
        }
    };

    // flatten the data
    useEffect(() => {
        if (data) {
            const tx = data.pages.flatMap((page) => page.data);
            setTransactions(tx);
        }
    }, [data]);

    if (isLoading || !currentAccount) return <LoadingScreen />;
    if (!currentAccount && (!isLoading || !isFetching)) return null;

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
                        refreshing: isFetching,
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
