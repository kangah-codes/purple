import { GenericAPIResponse } from '@/@types/request';
import { useAuth } from '@/components/Auth/hooks';
import { SessionData } from '@/components/Auth/schema';
import {
    LinearGradient,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { PlusIcon } from '@/components/SVG/24x24';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { router } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React, { useCallback } from 'react';
import { FlatList, RefreshControl, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAccounts, useAccountStore } from '../hooks';
import AccountsAccordion from '../molecules/AccountsAccordion';
import AccountsTotalSummary from '../molecules/AccountsTotalSummary';
import { Account } from '../schema';

export default function AccountsScreen() {
    const { sessionData } = useAuth();
    const { setAccounts, accounts } = useAccountStore();
    const { refetch, isFetching } = useAccounts({
        sessionData: sessionData as SessionData,
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
                        text2: "We couldn't fetch your accounts",
                    },
                });
            },
        },
        requestQuery: {},
    });

    const handleNavigation = useCallback(() => {
        router.push('/accounts/new-acount');
    }, []);

    const renderHeader = useCallback(
        () => (
            <View className='px-5 flex flex-col space-y-2.5 w-full'>
                <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg mt-2.5'>
                    Accounts
                </Text>
                <View className='h-1 border-gray-100 border-b w-full mb-2.5' />
                <AccountsTotalSummary accounts={accounts} />
            </View>
        ),
        [accounts],
    );

    const renderAccountAccordion = useCallback(() => {
        return <AccountsAccordion />;
    }, [accounts]);

    return (
        <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
            <ExpoStatusBar style='dark' />

            <FlatList
                data={[{ key: 'accordion' }]} // Single item to render AccountsAccordion
                renderItem={renderAccountAccordion}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{ paddingBottom: 300 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
            />

            <LinearGradient
                className='rounded-full justify-center items-center space-y-4 absolute right-5 bottom-5'
                colors={['#c084fc', '#9333ea']}
            >
                <TouchableOpacity
                    className='items-center w-[55px] h-[55px] justify-center rounded-full p-3'
                    onPress={handleNavigation}
                >
                    <PlusIcon stroke={'#fff'} />
                </TouchableOpacity>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
