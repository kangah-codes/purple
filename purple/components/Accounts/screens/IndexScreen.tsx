import { GenericAPIResponse } from '@/@types/request';
import { SafeAreaView, ScrollView } from '@/components/Shared/styled';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAccountStore, useAccounts } from '../hooks';
import AccountsAccordion from '../molecules/AccountsAccordion';
import AccountsAreaChart from '../molecules/AccountsAreaChart';
import AccountsNavigationArea from '../molecules/AccountsNavigationArea';
import { Account } from '../schema';

export default function AccountsScreen() {
    const { setAccounts, accounts } = useAccountStore();
    const { refetch, isFetching } = useAccounts({
        options: {
            onSuccess: (data) => {
                const res = data as GenericAPIResponse<Account[]>;
                setAccounts(res.data);
            },
            onError: () => {
                Toast.show({
                    type: 'error',
                    props: {
                        text1: 'Error!',
                        text2: "Couldn't fetch your accounts",
                    },
                });
            },
        },
        requestQuery: {
            page: 1,
            limit: Infinity,
        },
    });
    useRefreshOnFocus(refetch);

    useScreenTracking('accounts', {
        source: 'navigation',
    });

    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <ExpoStatusBar style='dark' />

            <ScrollView className='flex flex-col' contentContainerStyle={{ paddingBottom: 100 }}>
                <AccountsNavigationArea />
                <AccountsAreaChart />
                <AccountsAccordion />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
