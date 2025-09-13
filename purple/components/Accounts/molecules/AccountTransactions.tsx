import { View } from '@/components/Shared/styled';
import TransactionsAccordion from '@/components/Transactions/molecules/TransactionAccordion';
import { Transaction } from '@/components/Transactions/schema';
import React from 'react';

export default function AccountTransactions({ transactions }: { transactions: Transaction[] }) {
    return (
        <View className='px-5' style={{ paddingBottom: 200 }}>
            <View className='flex flex-col mt-5 pb-1 bg-purple-50 rounded-3xl border border-purple-100'>
                <TransactionsAccordion
                    title='Transactions'
                    transactions={transactions}
                    contentContainerStyle={{}}
                />
            </View>
        </View>
    );
}
