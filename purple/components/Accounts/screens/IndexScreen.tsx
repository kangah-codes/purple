import { GenericAPIResponse } from '@/@types/request';
import { PlusIcon } from '@/components/SVG/icons/24x24';
import {
    LinearGradient,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { useScreenTracking } from '@/lib/providers/Analytics';
import { router } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React, { useCallback } from 'react';
import { FlatList, StatusBar as RNStatusBar, RefreshControl, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAccountStore, useAccounts } from '../hooks';
import AccountsAccordion from '../molecules/AccountsAccordion';
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

    useScreenTracking('accounts', {
        source: 'navigation',
    });

    const handleNavigation = useCallback(() => {
        router.push('/accounts/new-acount');
    }, []);

    const renderHeader = useCallback(
        () => (
            <View className='px-5 flex flex-col space-y-2.5 w-full'>
                <Text style={satoshiFont.satoshiBlack} className='text-lg mt-2.5'>
                    Accounts
                </Text>
                <View className='h-1 border-purple-100 border-b w-full mb-2.5' />
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
