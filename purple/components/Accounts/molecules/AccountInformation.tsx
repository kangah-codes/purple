import { calculateAmountAddedOnDay } from '@/components/Plans/utils';
import { ArrowNarrowDownRightIcon, ArrowNarrowUpRightIcon } from '@/components/SVG/icons/noscale';
import { Text, View } from '@/components/Shared/styled';
import { Transaction } from '@/components/Transactions/schema';
import { satoshiFont } from '@/lib/constants/fonts';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import React, { useMemo } from 'react';
import { useAccountStore } from '../hooks';

export default function AccountInformation({ transactions }: { transactions: Transaction[] }) {
    const { currentAccount } = useAccountStore();
    const amountAdded = useMemo(
        () => calculateAmountAddedOnDay(transactions),
        [currentAccount, transactions],
    );

    if (!currentAccount) return null;

    return (
        <View className='px-5 flex flex-col space-y-2.5'>
            <View className='flex flex-col'>
                <Text
                    style={[
                        satoshiFont.satoshiBlack,
                        { color: currentAccount.balance < 0 ? '#DC2626' : '#000000' },
                    ]}
                    className='text-2xl tracking-tighter leading-[1.4] mt-1.5'
                >
                    {formatCurrencyAccurate(currentAccount.currency, currentAccount.balance)}
                </Text>

                {!!amountAdded && (
                    <View className='flex flex-row items-center space-x-1'>
                        {amountAdded > 0 ? (
                            <ArrowNarrowUpRightIcon width={16} height={16} stroke='#A855F7' />
                        ) : (
                            <ArrowNarrowDownRightIcon width={16} height={16} stroke='#fb2c36' />
                        )}
                        <Text
                            style={[
                                satoshiFont.satoshiBold,
                                { color: amountAdded > 0 ? '#A855F7' : '#fb2c36' },
                            ]}
                            className='text-sm'
                        >
                            {formatCurrencyAccurate(currentAccount.currency, amountAdded)} today
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
