import { Text, View } from '@/components/Shared/styled';
import { ArrowNarrowDownRightIcon, ArrowNarrowUpRightIcon } from '@/components/SVG/icons/noscale';
import { satoshiFont } from '@/lib/constants/fonts';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import React from 'react';
import { useAccountReportStore, useCalculateAccountData } from '../hooks';
import { Account } from '../schema';
import AccountCard from './AccountCard';

type AccountGroupCardProps = {
    accounts: Account[];
    group: string;
};

export default function AccountGroupCard({ group, accounts }: AccountGroupCardProps) {
    const { period } = useAccountReportStore();
    const { currentBalance, currency, percentageChange, absoluteChange } = useCalculateAccountData({
        accountGroup: group,
        timePeriod: period,
    });

    return (
        <View className='w-full flex flex-col p-4 border-[0.5px] border-purple-100 rounded-3xl space-y-2.5 bg-purple-50'>
            <View className='flex flex-col'>
                <View className='flex flex-row justify-between'>
                    <Text style={satoshiFont.satoshiBold} className='text-base'>
                        {group}
                    </Text>
                    <Text
                        style={[
                            satoshiFont.satoshiBlack,
                            { color: currentBalance < 0 ? '#EF4444' : '#A855F7' },
                        ]}
                        className='text-base'
                    >
                        {formatCurrencyAccurate(currency, currentBalance)}
                    </Text>
                </View>
                {percentageChange != 0 && (
                    <View className='flex flex-row justify-between mt-1'>
                        <View className='flex flex-row items-center space-x-1'>
                            {percentageChange > 0 ? (
                                <ArrowNarrowUpRightIcon width={16} height={16} stroke='#A855F7' />
                            ) : (
                                <ArrowNarrowDownRightIcon width={16} height={16} stroke='#EF4444' />
                            )}

                            <Text
                                style={[
                                    satoshiFont.satoshiBold,
                                    {
                                        color: percentageChange > 0 ? '#A855F7' : '#EF4444',
                                    },
                                ]}
                                className='text-xs'
                            >
                                {formatCurrencyAccurate(currency, absoluteChange)} (
                                {percentageChange}%)
                            </Text>
                        </View>
                    </View>
                )}
            </View>
            <View className='h-1 border-purple-100 border-b w-full mb-2.5' />
            <View className='flex flex-col space-y-4'>
                {accounts.map((account) => (
                    <View>
                        <AccountCard account={account} key={account.id} />
                    </View>
                ))}
            </View>
        </View>
    );
}
