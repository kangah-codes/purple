import { Account } from '@/components/Accounts/schema';
import { Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { ArrowCircleDownIcon, ArrowCircleUpIcon, CoinSwapIcon } from '../../SVG/icons/noscale';

export function ActionButton({
    IconComponent,
    label,
    type,
    account,
}: {
    IconComponent: React.ComponentType<SvgProps>;
    label: string;
    type: string;
    account: Account;
}) {
    return (
        <View className='flex flex-col items-center justify-center space-y-1.5'>
            <Link
                href={{
                    pathname: '/transactions/new',
                    params: {
                        type,
                        accountId: account.id,
                    },
                }}
            >
                <View
                    style={styles.actionButton}
                    className='border bg-white border-purple-200 px-5 py-2.5 rounded-full flex items-center justify-center relative'
                >
                    <IconComponent width={24} height={24} stroke='#9333ea' />
                </View>
            </Link>
            <Text style={[satoshiFont.satoshiBold]} className='text-sm text-[#9333ea]'>
                {label}
            </Text>
        </View>
    );
}

export default function ActionButtons({ account }: { account: Account }) {
    return (
        <View className='flex-row justify-between items-stretch w-auto px-16 py-2.5'>
            <ActionButton
                IconComponent={ArrowCircleDownIcon}
                label='Income'
                type='credit'
                account={account}
            />
            <ActionButton
                IconComponent={ArrowCircleUpIcon}
                label='Expense'
                type='debit'
                account={account}
            />
            <ActionButton
                IconComponent={CoinSwapIcon}
                label='Transfer'
                type='transfer'
                account={account}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    actionButton: {
        shadowColor: '#A855F7',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
