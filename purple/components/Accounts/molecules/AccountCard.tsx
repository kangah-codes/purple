import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { formatDistanceToNow } from 'date-fns';
import { router } from 'expo-router';
import React from 'react';
import { useAccountStore, useCalculateAccountData } from '../hooks';
import { Account } from '../schema';

type AccountCardProps = {
    account: Account;
};

export default function AccountCard({ account }: AccountCardProps) {
    const { setCurrentAccount } = useAccountStore();

    return (
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
                    <Text style={satoshiFont.satoshiBold} className='text-base text-black'>
                        {truncateStringIfLongerThan(account.name, 20)}
                    </Text>
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-500'>
                        Checking
                    </Text>
                </View>
            </View>
            <View className='flex flex-col justify-center items-end'>
                <Text style={satoshiFont.satoshiBlack} className='text-sm text-black'>
                    {formatCurrencyAccurate(account.currency, account.balance)}
                </Text>
                <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-500'>
                    {formatDistanceToNow(new Date(account.updated_at), {
                        addSuffix: true,
                    })}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
