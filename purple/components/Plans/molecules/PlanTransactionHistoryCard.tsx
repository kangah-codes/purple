import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { Text, View } from '../../Shared/styled';
import { PlanTransaction } from '../schema';
import React, { useMemo } from 'react';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import { usePlanStore } from '../hooks';
import { formatDateTime } from '@/lib/utils/date';
import { useGetAccountFromStore } from '@/components/Accounts/utils';
import { ArrowNarrowDownRightIcon } from '@/components/SVG/noscale';

type TransactionHistoryCardProps = {
    data: PlanTransaction;
};

export default function PlanTransactionHistoryCard({ data }: TransactionHistoryCardProps) {
    const { currentPlan } = usePlanStore();
    const account = useGetAccountFromStore(data.debit_account_id);

    if (!currentPlan) return null;

    const date = formatDateTime(data.CreatedAt);

    console.log(data.debit_account_id);

    return (
        <View className='flex flex-col py-2.5'>
            <Text style={GLOBAL_STYLESHEET.gramatikaBlack} className='text-base'>
                {formatCurrencyAccurate(currentPlan.currency, data.amount)}
            </Text>
            <Text style={GLOBAL_STYLESHEET.gramatikaMedium} className='text-sm text-gray-500'>
                {date.date} • {date.time}
            </Text>
            {data.debit_account_id && account && (
                <View className='flex flex-row items-center space-x-1'>
                    <ArrowNarrowDownRightIcon width={16} height={16} stroke='#F87171' />
                    <Text
                        style={GLOBAL_STYLESHEET.gramatikaMedium}
                        className='text-red-400 text-sm tracking-tight'
                    >
                        Deducted from {account.name} account
                    </Text>
                </View>
            )}
        </View>
    );
}
