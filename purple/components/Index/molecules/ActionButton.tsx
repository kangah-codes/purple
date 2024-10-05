import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { StyleSheet } from 'react-native';
import { SvgProps } from 'react-native-svg';
import {
    ArrowCircleDownIcon,
    ArrowCircleUpIcon,
    CoinSwapIcon,
    PiggyBankIcon,
} from '../../SVG/noscale';
import { Link } from 'expo-router';
import { Account } from '@/components/Accounts/schema';

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
                    pathname: type == 'plan' ? '/plans/new-plan' : '/transactions/new-transaction',
                    params: {
                        type,
                        accountId: account.ID,
                    },
                }}
            >
                <View className='border bg-white border-gray-200 shadow-xl w-14 h-14 rounded-full flex flex-col items-center justify-center space-y-1.5 relative'>
                    <IconComponent width={24} height={24} stroke='#9333ea' />
                </View>
            </Link>
            <Text style={[GLOBAL_STYLESHEET.interMedium, styles.actionText]}>{label}</Text>
        </View>
    );
}

export default function ActionButtons({ account }: { account: Account }) {
    return (
        <View className='flex-row justify-between items-stretch w-full px-7 pt-2.5'>
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
            <ActionButton
                IconComponent={PiggyBankIcon}
                label='Plan'
                type='plan'
                account={account}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    actionText: {
        color: '#1f2937',
        fontSize: 14,
        letterSpacing: -0.5,
    },
});
