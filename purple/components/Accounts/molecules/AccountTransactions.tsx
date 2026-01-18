import { SkeletonLine } from '@/components/Shared/molecules/Skeleton';
import { View } from '@/components/Shared/styled';
import TransactionsAccordion from '@/components/Transactions/molecules/TransactionAccordion';
import { Transaction } from '@/components/Transactions/schema';
import React from 'react';

export default function AccountTransactions({
    transactions,
    loading,
}: {
    transactions: Transaction[];
    loading: boolean;
}) {
    return (
        <View className='px-5' style={{ paddingBottom: 80 }}>
            {loading ? (
                <View className='mt-5'>
                    <View
                        className={`p-5 space-y-2 border border-purple-100 rounded-3xl bg-purple-50`}
                    >
                        <View className={`flex-row justify-between items-center`}>
                            <SkeletonLine width={80} height={20} />
                            <SkeletonLine width={40} height={20} />
                        </View>
                        <SkeletonLine width={168} height={20} />
                        <SkeletonLine width={80} height={20} />
                        <SkeletonLine width='100%' height={40} />

                        <View className={`flex-row justify-between items-center`}>
                            <SkeletonLine width={80} height={20} />
                            <SkeletonLine width={40} height={20} />
                        </View>
                        <SkeletonLine width={168} height={20} />
                        <SkeletonLine width={80} height={20} />
                        <SkeletonLine width='100%' height={40} />

                        <View className={`flex-row justify-between items-center`}>
                            <SkeletonLine width={80} height={20} />
                            <SkeletonLine width={40} height={20} />
                        </View>
                        <SkeletonLine width={168} height={20} />
                        <SkeletonLine width={80} height={20} />
                        <SkeletonLine width='100%' height={40} />
                    </View>
                </View>
            ) : (
                <View className='flex flex-col mt-5 pb-1 bg-purple-50 rounded-3xl border border-purple-100'>
                    <TransactionsAccordion
                        title='Transactions'
                        transactions={transactions}
                        contentContainerStyle={{}}
                    />
                </View>
            )}
        </View>
    );
}
