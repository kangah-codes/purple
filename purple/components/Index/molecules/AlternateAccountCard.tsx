import { Text, View } from '@/components/Shared/styled';
import { useState } from 'react';
import {
    ArrowCircleDownIcon,
    ArrowCircleUpIcon,
    CoinSwapIcon,
    EyeCloseIcon,
    EyeOpenIcon,
    PiggyBankIcon,
} from '../../SVG/noscale';
import { StyleSheet } from 'react-native';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';

type AlternateAccountCardProps = {
    accountCurrency: string;
    accountBalance: number;
    accountName: string;
    cardBackgroundColour: string;
    cardTintColour: string;
};

const styles = StyleSheet.create({
    actionButton: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.0625,
        shadowRadius: 10,
        elevation: 5,
    },
});

export default function AlternateAccountCard({ item }: { item: AlternateAccountCardProps }) {
    // show/hide the account balance
    const [showAmount, setShowAmount] = useState(true);

    return (
        <View className='w-full flex flex-col space-y-1.5 relative'>
            <View className='flex flex-row space-x-2 items-center'>
                <Text style={GLOBAL_STYLESHEET.suprapower} className='text-black text-sm'>
                    Available Balance
                </Text>
                {showAmount ? (
                    <EyeOpenIcon
                        width={16}
                        height={16}
                        stroke={'black'}
                        onPress={() => setShowAmount(!showAmount)}
                    />
                ) : (
                    <EyeCloseIcon
                        width={16}
                        height={16}
                        stroke={'black'}
                        onPress={() => setShowAmount(!showAmount)}
                    />
                )}
            </View>

            <View className='flex flex-col space-y-1.5'>
                <View className='flex flex-row items-end'>
                    <Text style={GLOBAL_STYLESHEET.suprapower} className='text-black text-3xl'>
                        $45,300,000
                    </Text>
                    <Text
                        style={GLOBAL_STYLESHEET.suprapower}
                        className='text-gray-700 text-2xl tracking-tighter'
                    >
                        .86
                    </Text>
                </View>
                <Text
                    style={GLOBAL_STYLESHEET.interMedium}
                    className='text-gray-600 text-base tracking-tighter'
                >
                    {item.accountName}
                </Text>
            </View>

            <View className='py-2.5'>
                <View className='h-[1px] bg-gray-200 w-full' />
            </View>

            <View className='flex flex-row flex-grow justify-between space-x-2 items-stretch w-full px-7'>
                <View className='flex flex-col items-center justify-center space-y-1.5'>
                    <View
                        style={styles.actionButton}
                        className='border bg-white border-gray-200 shadow-xl w-14 h-14 rounded-full flex flex-col items-center justify-center space-y-1.5 relative'
                    >
                        <ArrowCircleDownIcon width={24} height={24} stroke='#9333ea' />
                    </View>
                    <Text
                        style={GLOBAL_STYLESHEET.interMedium}
                        className='text-gray-800 text-sm tracking-tighter'
                    >
                        Income
                    </Text>
                </View>
                <View className='flex flex-col items-center justify-center space-y-1.5'>
                    <View
                        style={styles.actionButton}
                        className='border bg-white border-gray-200 shadow-xl w-14 h-14 rounded-full flex flex-col items-center justify-center space-y-1.5 relative'
                    >
                        <ArrowCircleUpIcon width={24} height={24} stroke='#9333ea' />
                    </View>
                    <Text
                        style={GLOBAL_STYLESHEET.interMedium}
                        className='text-gray-800 text-sm tracking-tighter'
                    >
                        Expense
                    </Text>
                </View>
                <View className='flex flex-col items-center justify-center space-y-1.5'>
                    <View
                        style={styles.actionButton}
                        className='border bg-white border-gray-200 shadow-xl w-14 h-14 rounded-full flex flex-col items-center justify-center space-y-1.5 relative'
                    >
                        <CoinSwapIcon width={24} height={24} stroke='#9333ea' />
                    </View>
                    <Text
                        style={GLOBAL_STYLESHEET.interMedium}
                        className='text-gray-800 text-sm tracking-tighter'
                    >
                        Transfer
                    </Text>
                </View>
                <View className='flex flex-col items-center justify-center space-y-1.5'>
                    <View
                        style={styles.actionButton}
                        className='border bg-white border-gray-200 shadow-xl w-14 h-14 rounded-full flex flex-col items-center justify-center space-y-1.5 relative'
                    >
                        <PiggyBankIcon width={24} height={24} stroke='#9333ea' />
                    </View>
                    <Text
                        style={GLOBAL_STYLESHEET.interMedium}
                        className='text-gray-800 text-sm tracking-tighter'
                    >
                        Plan
                    </Text>
                </View>
            </View>
        </View>
    );
}
