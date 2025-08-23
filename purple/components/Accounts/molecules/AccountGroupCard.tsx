import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Account } from '../schema';
import { usePreferences } from '@/components/Settings/hooks';
import { formatDistanceToNow } from 'date-fns';
import { ArrowNarrowUpRightIcon } from '@/components/SVG/icons/noscale';
import { Link, router } from 'expo-router';
import { useAccountStore } from '../hooks';
import { truncateStringIfLongerThan } from '@/lib/utils/string';

type AccountGroupCardProps = {
    accounts: Account[];
    group: string;
};

export default function AccountGroupCard({ group, accounts }: AccountGroupCardProps) {
    const { setCurrentAccount } = useAccountStore();
    const {
        preferences: { currency },
    } = usePreferences();

    return (
        <View
            className='w-full flex flex-col p-5 border border-purple-200 rounded-3xl space-y-2.5 bg-white'
            style={styles.shadow}
        >
            <View className='flex flex-col'>
                <View className='flex flex-row justify-between'>
                    <Text style={satoshiFont.satoshiBold} className='text-base'>
                        {group}
                    </Text>
                    <Text style={satoshiFont.satoshiBlack} className='text-base'>
                        {formatCurrencyAccurate('USD', 65602.83)}
                    </Text>
                </View>
                <View className='flex flex-row justify-between mt-1'>
                    <View className='flex flex-row items-center space-x-1'>
                        <ArrowNarrowUpRightIcon width={16} height={16} stroke='#A855F7' />

                        <Text
                            style={[satoshiFont.satoshiBold, { color: '#A855F7' }]}
                            className='text-xs'
                        >
                            {formatCurrencyAccurate('USD', 32)} (3.5%) 1 month
                        </Text>
                    </View>
                    <Text style={satoshiFont.satoshiBold} className='text-xs'>
                        {formatCurrencyAccurate('USD', 65602.83)}
                    </Text>
                </View>
            </View>
            <View className='h-1 border-purple-100 border-b w-full mb-2.5' />
            <View className='flex flex-col space-y-4'>
                {accounts.map((account) => (
                    <TouchableOpacity
                        onPress={() => {
                            setCurrentAccount(account);
                            router.push({
                                pathname: '/accounts/account-transactions',
                                params: { accountName: account.name, accountID: account.id },
                            });
                        }}
                        className='flex flex-row justify-between'
                    >
                        <View className='flex flex-row space-x-2.5 items-center'>
                            <LinearGradient
                                className='justify-center items-center rounded-xl h-10 w-10'
                                colors={['#c084fc', '#9333ea']}
                            />
                            <View className='flex flex-col justify-center space-y-1'>
                                <Text
                                    style={satoshiFont.satoshiBold}
                                    className='text-base text-black'
                                >
                                    {truncateStringIfLongerThan(account.name, 20)}
                                </Text>
                                <Text
                                    style={satoshiFont.satoshiMedium}
                                    className='text-xs text-gray-500'
                                >
                                    Checking
                                </Text>
                            </View>
                        </View>
                        <View className='flex flex-col justify-center items-end'>
                            <Text style={satoshiFont.satoshiBold} className='text-sm text-black'>
                                {formatCurrencyAccurate(account.currency, account.balance)}
                            </Text>
                            <Text
                                style={satoshiFont.satoshiBold}
                                className='text-xs text-purple-400'
                            >
                                {formatDistanceToNow(new Date(account.updated_at), {
                                    addSuffix: true,
                                })}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // create a shadow equally around all sides for ios and android
    shadow: {
        // shadowColor: '#A855F7',
        // shadowOffset: {
        //     width: 0,
        //     height: 0,
        // },
        // shadowOpacity: 0.25,
        // shadowRadius: 8, // increased for a more even spread
        // elevation: 8, // higher elevation for Android to match iOS shadow
    },
});
