import { Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { EyeCloseIcon, EyeOpenIcon } from '../../SVG/noscale';
import React from 'react';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { Account } from '@/components/Accounts/schema';

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
        <>
            <View className='flex flex-row space-x-2 items-center'>
                <Text style={GLOBAL_STYLESHEET.suprapower} className='text-black text-sm'>
                    Available Balance
                </Text>
                {showAmount ? (
                    <EyeOpenIcon
                        width={16}
                        height={16}
                        stroke='black'
                        onPress={() => setShowAmount(false)}
                    />
                ) : (
                    <EyeCloseIcon
                        width={16}
                        height={16}
                        stroke='black'
                        onPress={() => setShowAmount(true)}
                    />
                )}
            </View>
            <Text
                style={GLOBAL_STYLESHEET.interSemiBold}
                className='text-black text-[28px] tracking-tight leading-[1.4] mt-1.5'
            >
                {showAmount ? formatCurrencyRounded(account.balance, account.currency) : '********'}
            </Text>
            <Text
                style={GLOBAL_STYLESHEET.interMedium}
                className='text-gray-600 text-base tracking-tighter mt-1.5'
            >
                {accountName}
            </Text>
        </>
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
