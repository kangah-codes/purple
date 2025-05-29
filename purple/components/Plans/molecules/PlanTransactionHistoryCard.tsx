import { useGetAccountFromStore } from '@/components/Accounts/utils';
import { ArrowNarrowDownRightIcon } from '@/components/SVG/icons/noscale';
import { Transaction } from '@/components/Transactions/schema';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { formatDateTime } from '@/lib/utils/date';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import React from 'react';
import { Text, TouchableOpacity, View } from '../../Shared/styled';
import { usePlanStore } from '../hooks';
import { useTransactionStore } from '@/components/Transactions/hooks';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';

type TransactionHistoryCardProps = {
    data: Transaction;
};

export default function PlanTransactionHistoryCard({ data }: TransactionHistoryCardProps) {
    const { currentPlan } = usePlanStore();
    const { setCurrentTransaction } = useTransactionStore();
    const { setShowBottomSheetModal } = useBottomSheetModalStore();
    const account = useGetAccountFromStore(data.account.id);
    const date = formatDateTime(data.created_at);

    if (!currentPlan) return null;

    return (
        <TouchableOpacity
            className='flex flex-col py-2.5'
            onPress={() => {
                setCurrentTransaction(data);
                setShowBottomSheetModal('transactionReceipt', true);
            }}
        >
            <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-base'>
                {formatCurrencyAccurate(currentPlan.currency, data.amount)}
            </Text>
            <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-sm text-purple-500'>
                {date.date} • {date.time}
            </Text>
            {data.account && account && (
                <View className='flex flex-row items-center space-x-1'>
                    <ArrowNarrowDownRightIcon width={16} height={16} stroke='#F87171' />
                    <Text
                        style={GLOBAL_STYLESHEET.satoshiBold}
                        className='text-red-500 text-sm tracking-tight'
                    >
                        Deducted from {account.name} account
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}
