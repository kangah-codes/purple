import React, { useCallback } from 'react';
import {
    InputField,
    LinearGradient,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { RefreshControl, StatusBar as RNStatusBar, StyleSheet, FlatList } from 'react-native';
import AccountsTotalSummary from '../molecules/AccountsTotalSummary';
import { PlusIcon } from '@/components/SVG/24x24';
import AccountsAccordion from '../molecules/AccountsAccordion';
import { router } from 'expo-router';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { GenericAPIResponse } from '@/@types/request';
import { useAuth } from '@/components/Auth/hooks';
import { SessionData } from '@/components/Auth/schema';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import Toast from 'react-native-toast-message';
import { useAccounts, useAccountStore } from '../hooks';
import { Account } from '../schema';

export default function AccountsScreen() {
    const { sessionData } = useAuth();
    const { setAccounts, accounts } = useAccountStore();
    const { setShowBottomSheetModal } = useBottomSheetModalStore();
    const { isLoading, data, refetch, isFetching } = useAccounts({
        sessionData: sessionData as SessionData,
        options: {
            onSuccess: (data) => {
                const res = data as GenericAPIResponse<Account[]>;
                console.log(res.data);
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
        requestParams: {},
    });

    const handleNavigation = useCallback(() => {
        router.push('/accounts/new-acount');
    }, []);

    const renderHeader = useCallback(
        () => (
            <View className='px-5 flex flex-col space-y-2.5'>
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
