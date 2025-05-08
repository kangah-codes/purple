import { Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { EyeCloseIcon, EyeOpenIcon } from '../../SVG/noscale';
import React from 'react';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { Account } from '@/components/Accounts/schema';
import { satoshiFont } from '@/lib/constants/fonts';
import { Link } from 'expo-router';

// TODO: Add types for props
export function BalanceDisplay({
    showAmount,
    setShowAmount,
    balance,
    accountName,
    account,
}: {
    showAmount: boolean;
    setShowAmount: (value: boolean) => void;
    balance: number;
    accountName: string;
    account: Account;
}) {
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
                <Text style={satoshiFont.satoshiBold} className='text-black text-base'>
                    {accountName}
                </Text>
            </View>
        </Link>
    );
}

/**
 * box-sizing: border-box;
  color: #101828;
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -.02em;
  line-height: 1.4;
  margin-bottom: 1rem;
  margin-top: 2.5rem;
 */
