import { GenericAPIResponse } from '@/@types/request';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@/components/SVG/icons/24x24';
import {
    LinearGradient,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import { useScreenTracking } from '@/lib/hooks/useAnalytics';
import { router } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { FlatList, StatusBar as RNStatusBar, RefreshControl, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAccountStore, useAccounts } from '../hooks';
import AccountsAccordion from '../molecules/AccountsAccordion';
import { Account } from '../schema';
import AccountGroupCard from '../molecules/AccountGroupCard';
import { DotsHorizontalIcon } from '@/components/SVG/icons/noscale';
import AccountActivityAreaChart from '../molecules/AccountActivityAreaChart';
import { useTransactionStore } from '@/components/Transactions/hooks';
import AccountsAreaChart from '../molecules/AccountsAreaChart';
import DropdownMenuDeprecated from '@/components/Shared/molecules/DropdownMenuDeprecated';
import { MenuOption } from '@/components/Shared/molecules/DropdownMenuDeprecated/MenuOption';

export default function AccountsScreen() {
    const [visible, setVisible] = useState(false);
    const { transactions } = useTransactionStore();
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

    const handleNavigation = useCallback(() => {
        router.push('/accounts/new-acount');
    }, []);

    const renderHeader = useCallback(
        () => (
            <View className='px-5 flex flex-col space-y-2.5 w-full'>
                <Text style={satoshiFont.satoshiBlack} className='text-lg mt-2.5'>
                    Accounts
                </Text>
                <View className='h-1 border-purple-100 border-b w-full mb-5' />
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

            <ScrollView className='flex flex-col' contentContainerStyle={{ paddingBottom: 100 }}>
                <View className='w-full flex flex-row py-2.5 justify-between items-center relative px-5'>
                    <DropdownMenuDeprecated
                        visible={visible}
                        handleOpen={() => setVisible(true)}
                        handleClose={() => setVisible(false)}
                        trigger={
                            <View
                                // onPress={router.back}
                                className='bg-purple-50 px-4 py-2 flex items-center justify-center rounded-full'
                            >
                                <DotsHorizontalIcon
                                    stroke='#9333EA'
                                    strokeWidth={2.5}
                                    width={24}
                                    height={24}
                                />
                            </View>
                        }
                        padX={20}
                        dropdownWidth={180}
                    >
                        <MenuOption onSelect={alert}>
                            <View className='flex flex-row items-center space-x-1'>
                                <TrashIcon stroke='#EF4444' width={18} />
                                <Text style={satoshiFont.satoshiMedium} className='text-sm'>
                                    Delete
                                </Text>
                            </View>
                        </MenuOption>
                        <MenuOption onSelect={alert}>
                            <View className='flex flex-row items-center space-x-1'>
                                <TrashIcon stroke='#EF4444' width={18} />
                                <Text style={satoshiFont.satoshiMedium} className='text-sm'>
                                    Delete
                                </Text>
                            </View>
                        </MenuOption>
                    </DropdownMenuDeprecated>

                    <View className='absolute left-0 right-0 items-center'>
                        <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                            Accounts
                        </Text>
                    </View>

                    <LinearGradient
                        className='rounded-full justify-center items-center'
                        colors={['#c084fc', '#9333ea']}
                    >
                        <TouchableOpacity
                            className='px-4 py-2 flex items-center justify-center rounded-full'
                            onPress={handleNavigation}
                        >
                            <PlusIcon stroke={'#fff'} width={24} height={24} />
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
                <View className='mb-7'>
                    <AccountsAreaChart transactions={transactions} />
                </View>
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
