import { GenericAPIResponse } from '@/@types/request';
import { useAccountStore } from '@/components/Accounts/hooks';
import { useAuth } from '@/components/Auth/hooks';
import { SessionData, User } from '@/components/Auth/schema';
import { useUser, useUserStore } from '@/components/Profile/hooks';
import { LinearGradient, SafeAreaView, ScrollView, Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar as RNStatusBar, RefreshControl, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import AccountCardCarousel from '../molecules/AccountCardCarousel';
import PlanHistoryList from '../molecules/PlanHistoryList';
import TransactionHistoryList from '../molecules/TransactionHistoryList';
import { useTransactionStore } from '@/components/Transactions/hooks';
import AnimatedClouds from '@/components/Shared/molecules/AnimatedClouds';
import { useRefreshOnFocus } from '@/lib/hooks/refetchOnFocus';
import { useSQLiteContext } from 'expo-sqlite';

const linearGradientColours = ['#D8B4FE', '#fff'];

export default function IndexScreen() {
    const { sessionData } = useAuth();
    const { setAccounts } = useAccountStore();
    const { updateTransactions } = useTransactionStore();
    const { setUser } = useUserStore();
    const [refreshing, setRefreshing] = useState(false);
    const db = useSQLiteContext();
    // TODO: refactor this to a better named hook
    const { refetch, data } = useUser({
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
            onSettled: () => {
                setRefreshing(false);
            },
            onSuccess: (data) => {
                const res = data as GenericAPIResponse<User>;
                setUser(res.data);
                setAccounts(res.data.accounts);
                updateTransactions(res.data.transactions);
            },
        },
    });
    useRefreshOnFocus(refetch);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        refetch();
    }, []);

    return (
        <SafeAreaView className='bg-white'>
            <ExpoStatusBar style='dark' />
            <View className='w-full relative flex' style={styles.parentView}>
                <LinearGradient
                    className='flex px-5 py-2.5 h-[350] absolute w-full'
                    colors={linearGradientColours}
                />
                <AnimatedClouds baseSpeed={0.1} minHeight={10} maxHeight={450} spawnRate={5} />
                <View className='flex flex-col'>
                    {/* <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-lg px-5'>
                        Hi, {sessionData?.user.username} 👋
                    </Text> */}

                    <ScrollView
                        className='mt-5 h-full'
                        contentContainerStyle={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    >
                        <AccountCardCarousel />
                        <PlanHistoryList />
                        <TransactionHistoryList transactions={data?.data.transactions} />
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    searchIcon: {
        position: 'absolute',
        left: 15,
    },
    parentView: {
        paddingTop: (RNStatusBar.currentHeight ?? 0) + 10, // TODO: idk why this worked
    },
    scrollView: {
        paddingBottom: 100,
    },
});
