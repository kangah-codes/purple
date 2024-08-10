import { formatCurrencyAccurate, formatCurrencyRounded } from '@/lib/utils/number';
import { useState } from 'react';
import {
    ArrowCircleDownIcon,
    ArrowCircleUpIcon,
    CoinSwapIcon,
    EyeCloseIcon,
    EyeOpenIcon,
    PiggyBankIcon,
} from '../../SVG/icons';
import { LinearGradient, Text, View } from '@/components/Shared/styled';

type AccountCard = {
    accountCurrency: string;
    accountBalance: number;
    accountName: string;
    cardBackgroundColour: string;
    cardTintColour: string;
};

export default function AccountCard({ item }: { item: AccountCard }) {
    // show/hide the account balance
    const [showAmount, setShowAmount] = useState(true);

    return (
        <LinearGradient
            className='w-full p-5 rounded-2xl flex flex-col justify-center items-center space-y-4 relative'
            // style={{ backgroundColor: item.cardBackgroundColour }}
            colors={['#c084fc', '#9333ea']}
        >
            <View className='flex flex-row space-x-2 items-center'>
                <Text style={{ fontFamily: 'Suprapower' }} className='text-white text-base'>
                    Available Balance
                </Text>
                {showAmount ? (
                    <EyeOpenIcon
                        width={16}
                        height={16}
                        stroke={'#fff'}
                        onPress={() => setShowAmount(!showAmount)}
                    />
                ) : (
                    <EyeCloseIcon
                        width={16}
                        height={16}
                        stroke={'#fff'}
                        onPress={() => setShowAmount(!showAmount)}
                    />
                )}
            </View>

            <View className='flex flex-col items-center'>
                <Text style={{ fontFamily: 'Suprapower' }} className='text-white text-2xl'>
                    {showAmount
                        ? item.accountBalance > 9_999_999
                            ? formatCurrencyRounded(item.accountBalance, item.accountCurrency)
                            : formatCurrencyAccurate(item.accountCurrency, item.accountBalance)
                        : 'GHS ******'}
                </Text>
                <Text
                    style={{ fontFamily: 'InterSemiBold' }}
                    className='text-white text-base tracking-tighter'
                >
                    {item.accountName}
                </Text>
            </View>

            <View className='h-[1px] bg-white w-full' />

            <View className='flex flex-row flex-grow justify-between space-x-2 items-stretch w-full px-4'>
                <View className='flex flex-col items-center justify-center space-y-1.5'>
                    <View className='bg-white w-12 h-12 rounded-full flex flex-col items-center justify-center space-y-1.5 relative'>
                        <ArrowCircleDownIcon width={24} height={24} stroke='#9333EA' />
                    </View>
                    <Text
                        style={{ fontFamily: 'InterSemiBold' }}
                        className='text-white text-sm tracking-tighter'
                    >
                        Income
                    </Text>
                </View>
                <View className='flex flex-col items-center justify-center space-y-1.5'>
                    <View className='bg-white w-12 h-12 rounded-full flex flex-col items-center justify-center space-y-1.5 relative'>
                        <ArrowCircleUpIcon width={24} height={24} stroke='#9333EA' />
                    </View>
                    <Text
                        style={{ fontFamily: 'InterSemiBold' }}
                        className='text-white text-sm tracking-tighter'
                    >
                        Expense
                    </Text>
                </View>
                <View className='flex flex-col items-center justify-center space-y-1.5'>
                    <View className='bg-white w-12 h-12 rounded-full flex flex-col items-center justify-center space-y-1.5 relative'>
                        <CoinSwapIcon width={24} height={24} stroke='#9333EA' />
                    </View>
                    <Text
                        style={{ fontFamily: 'InterSemiBold' }}
                        className='text-white text-sm tracking-tighter'
                    >
                        Transfer
                    </Text>
                </View>
                <View className='flex flex-col items-center justify-center space-y-1.5'>
                    <View className='bg-white w-12 h-12 rounded-full flex flex-col items-center justify-center space-y-1.5 relative'>
                        <PiggyBankIcon width={24} height={24} stroke='#9333EA' />
                    </View>
                    <Text
                        style={{ fontFamily: 'InterSemiBold' }}
                        className='text-white text-sm tracking-tighter'
                    >
                        Budget
                    </Text>
                </View>
            </View>
        </LinearGradient>
    );
}
