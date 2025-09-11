import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import { extractEmojiOrDefault, stripEmojis, truncateStringIfLongerThan } from '@/lib/utils/string';
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
                <View className='flex items-center justify-center h-10 w-10 rounded-xl bg-purple-100'>
                    <Text style={satoshiFont.satoshiBold} className='text-base'>
                        {extractEmojiOrDefault(account.subcategory ?? '', '❔')}
                    </Text>
                </View>
                <View className='flex flex-col justify-center space-y-1'>
                    <Text style={satoshiFont.satoshiBold} className='text-base text-black'>
                        {truncateStringIfLongerThan(account.name, 20)}
                    </Text>
                    {account.subcategory && (
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-500'>
                            {stripEmojis(account.subcategory)}
                        </Text>
                    )}
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
