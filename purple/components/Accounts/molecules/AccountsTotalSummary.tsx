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
            assets,
            liabilities,
            total,
        };
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'GHS', // Assuming USD, change if needed
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const { assets, liabilities, total } = calculateTotals(accounts);

    return (
        <View className='flex flex-row justify-between mb-5'>
            <AccountSummary title='Assets' amount={formatCurrency(assets)} color='#15803D' />
            <AccountSummary
                title='Liabilities'
                amount={formatCurrency(liabilities)}
                color='#DC2626'
            />
            <AccountSummary title='Total' amount={formatCurrency(total)} color='#7C3AED' />
        </View>
    );
}
