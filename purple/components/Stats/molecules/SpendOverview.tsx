import { usePreferences } from '@/components/Settings/hooks';
import { Text, View } from '@/components/Shared/styled';
import { Transaction } from '@/components/Transactions/schema';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { formatCurrencyRounded } from '@/lib/utils/number';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

type SpendOverviewProps = {
    transactions: Transaction[];
};

export default function SpendOverview({ transactions }: SpendOverviewProps) {
    const {
        preferences: { currency },
    } = usePreferences();
    const { totalDebits, totalCredits } = useMemo(() => {
        const totals = transactions.reduce(
            (acc, tx) => {
                if (tx.type === 'debit') {
                    acc.totalDebits += tx.amount;
                } else if (tx.type === 'credit') {
                    acc.totalCredits += tx.amount;
                }
                return acc;
            },
            { totalDebits: 0, totalCredits: 0 },
        );

        return totals;
    }, [transactions]);

    return (
        <View className='flex flex-col px-5'>
            <View className='flex flex-row space-x-2.5'>
                <View className='flex-1 flex-col p-5 bg-purple-50 rounded-3xl'>
                    <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-xs text-purple-500'>
                        Total Income
                    </Text>
                    <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-xl text-green-600'>
                        {formatCurrencyRounded(totalCredits, currency)}
                    </Text>
                </View>

                <View className='flex-1 flex-col p-5 bg-purple-50 rounded-3xl'>
                    <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-xs text-purple-500'>
                        Total Expenses
                    </Text>
                    <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-xl text-red-600'>
                        {formatCurrencyRounded(totalDebits, currency)}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {},
});
