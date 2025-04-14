import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { Text, View } from '../../Shared/styled';
import { PlanTransaction } from '../schema';
import React, { useMemo } from 'react';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import { usePlanStore } from '../hooks';
import { formatDateTime } from '@/lib/utils/date';
import { useGetAccountFromStore } from '@/components/Accounts/utils';
import { ArrowNarrowDownRightIcon } from '@/components/SVG/noscale';
import { Transaction } from '@/components/Transactions/schema';

type TransactionHistoryCardProps = {
    data: Transaction;
};

export default function PlanTransactionHistoryCard({ data }: TransactionHistoryCardProps) {
    const { currentPlan } = usePlanStore();
    const account = useGetAccountFromStore(data.account.id);
    const date = formatDateTime(data.created_at);

    if (!currentPlan) return null;

    return (
        <View className='flex flex-col py-2.5'>
            <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-base'>
                {formatCurrencyAccurate(currentPlan.currency, data.amount)}
            </Text>
            <Text style={GLOBAL_STYLESHEET.satoshiMedium} className='text-sm text-gray-500'>
                {date.date} • {date.time}
            </Text>
            {data.account && account && (
                <View className='flex flex-row items-center space-x-1'>
                    <ArrowNarrowDownRightIcon width={16} height={16} stroke='#F87171' />
                    <Text
                        style={GLOBAL_STYLESHEET.satoshiMedium}
                        className='text-red-400 text-sm tracking-tight'
                    >
                        Deducted from {account.name} account
                    </Text>
                </View>
            )}
        </View>
    );
}
