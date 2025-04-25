import { calculateAmountAddedOnDay } from '@/components/Plans/utils';
import { ArrowNarrowUpRightIcon } from '@/components/SVG/noscale';
import { Text, View } from '@/components/Shared/styled';
import { Transaction } from '@/components/Transactions/schema';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import React, { useMemo } from 'react';
import { useAccountStore } from '../hooks';

export default function AccountInformation({ transactions }: { transactions: Transaction[] }) {
    const { currentAccount } = useAccountStore();
    const amountAdded = useMemo(() => calculateAmountAddedOnDay(transactions), [currentAccount]);

    if (!currentAccount) return null;

    return (
        <View className='px-5 flex flex-col space-y-2.5'>
            <View className='flex flex-col'>
                <Text
                    style={[
                        GLOBAL_STYLESHEET.satoshiBlack,
                        {
                            color: currentAccount.balance < 0 ? '#DC2626' : '#000000',
                        },
                    ]}
                    className='text-3xl tracking-tighter leading-[1.4] mt-1.5'
                >
                    {formatCurrencyAccurate(currentAccount.currency, currentAccount.balance)}
                </Text>
                {amountAdded > 0 && (
                    <View className='flex flex-row items-center space-x-1'>
                        <ArrowNarrowUpRightIcon width={16} height={16} stroke='#A855F7' />
                        <Text
                            style={GLOBAL_STYLESHEET.satoshiBold}
                            className='text-purple-500 text-sm'
                        >
                            {formatCurrencyAccurate(currentAccount.currency, amountAdded)} recorded
                            today
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
