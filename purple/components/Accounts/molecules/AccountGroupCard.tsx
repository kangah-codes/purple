import { Text, View } from '@/components/Shared/styled';
import { ArrowNarrowDownRightIcon, ArrowNarrowUpRightIcon } from '@/components/SVG/icons/noscale';
import { satoshiFont } from '@/lib/constants/fonts';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useCalculateAccountData } from '../hooks';
import { Account } from '../schema';
import AccountCard from './AccountCard';

type AccountGroupCardProps = {
    accounts: Account[];
    group: string;
};

export default function AccountGroupCard({ group, accounts }: AccountGroupCardProps) {
    const accountGroupData = useCalculateAccountData({
        accountGroup: group,
        timePeriod: '1Y',
    });

    return (
        <View
            className='w-full flex flex-col p-4 border-[0.5px] border-purple-100 rounded-3xl space-y-2.5 bg-purple-50'
            style={styles.shadow}
        >
            <View className='flex flex-col'>
                <View className='flex flex-row justify-between'>
                    <Text style={satoshiFont.satoshiBold} className='text-base'>
                        {group}
                    </Text>
                    <Text style={satoshiFont.satoshiBlack} className='text-base'>
                        {formatCurrencyAccurate(
                            accountGroupData.currency,
                            accountGroupData.currentBalance,
                        )}
                    </Text>
                </View>
                {accountGroupData.percentageChange != 0 && (
                    <View className='flex flex-row justify-between mt-1'>
                        <View className='flex flex-row items-center space-x-1'>
                            {accountGroupData.percentageChange > 0 ? (
                                <ArrowNarrowUpRightIcon width={16} height={16} stroke='#A855F7' />
                            ) : (
                                <ArrowNarrowDownRightIcon width={16} height={16} stroke='#EF4444' />
                            )}

                            <Text
                                style={[
                                    satoshiFont.satoshiBold,
                                    {
                                        color:
                                            accountGroupData.percentageChange > 0
                                                ? '#A855F7'
                                                : '#EF4444',
                                    },
                                ]}
                                className='text-xs'
                            >
                                {formatCurrencyAccurate(
                                    accountGroupData.currency,
                                    accountGroupData.absoluteChange,
                                )}{' '}
                                ({accountGroupData.percentageChange}%) 1 month
                            </Text>
                        </View>
                    </View>
                )}
            </View>
            <View className='h-1 border-purple-100 border-b w-full mb-2.5' />
            <View className='flex flex-col space-y-4'>
                {accounts.map((account) => (
                    <AccountCard account={account} key={account.id} />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // create a shadow equally around all sides for ios and android
    shadow: {
        // shadowColor: '#c27aff',
        // shadowOffset: {
        //     width: 0,
        //     height: 0,
        // },
        // shadowOpacity: 0.25,
        // shadowRadius: 8, // increased for a more even spread
        // elevation: 8, // higher elevation for Android to match iOS shadow
    },
});
