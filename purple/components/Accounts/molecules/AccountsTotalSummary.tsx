import React from 'react';
import { Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { Account } from '../schema';

function AccountSummary({
    title,
    amount,
    color,
}: {
    title: string;
    amount: string;
    color: string;
}) {
    return (
        <View className='flex flex-col items-center'>
            <Text style={GLOBAL_STYLESHEET.interRegular} className='tracking-tighter'>
                {title}
            </Text>
            <Text
                style={[
                    GLOBAL_STYLESHEET.interBold,
                    {
                        color,
                    },
                ]}
                className='tracking-tight text-sm'
            >
                {amount}
            </Text>
        </View>
    );
}

export default function AccountsTotalSummary({ accounts }: { accounts: Account[] }) {
    const calculateTotals = (accounts: Account[]) => {
        let assets = 0;
        let liabilities = 0;

        accounts.forEach((account) => {
            if (account.balance >= 0) {
                assets += account.balance;
            } else {
                liabilities += Math.abs(account.balance);
            }
        });

        const total = assets - liabilities;

        return {
            assets: assets.toFixed(2),
            liabilities: liabilities.toFixed(2),
            total: total.toFixed(2),
        };
    };

    const { assets, liabilities, total } = calculateTotals(accounts);

    return (
        <View className='flex flex-row justify-between mb-5'>
            <AccountSummary title='Assets' amount={assets.toString()} color='#15803D' />
            <AccountSummary title='Liabilities' amount={liabilities.toString()} color='#DC2626' />
            <AccountSummary title='Total' amount={total.toString()} color='#7C3AED' />
        </View>
    );
}
