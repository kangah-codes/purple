import { Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { EyeCloseIcon, EyeOpenIcon, PinIcon } from '../../SVG/noscale';
import React from 'react';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { Account } from '@/components/Accounts/schema';
import { satoshiFont } from '@/lib/constants/fonts';
import { Link } from 'expo-router';

type BalanceDisplayProps = {
    accountName: string;
    account: Account;
    isPinned: boolean;
};

export function BalanceDisplay({ accountName, account, isPinned }: BalanceDisplayProps) {
    return (
        <Link
            href={{
                pathname: '/accounts/account-transactions',
                params: { accountName: account.name, accountID: account.id },
            }}
        >
            <View className='flex flex-col'>
                <Text style={satoshiFont.satoshiBlack} className='text-black text-3xl'>
                    {formatCurrencyRounded(account.balance, account.currency)}
                </Text>
                <View className='flex flex-row space-x-2 items-center'>
                    <Text style={satoshiFont.satoshiBold} className='text-black text-base'>
                        {accountName}
                    </Text>

                    {isPinned && <PinIcon width={15} height={15} stroke={'#9333ea'} />}
                </View>
            </View>
        </Link>
    );
}
