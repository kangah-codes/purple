import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { Text, TouchableOpacity, View } from '../../Shared/styled';
import { StyleSheet } from 'react-native';

type TransactionBreakdownCardProps = {
    data: {
        type: string;
        category: string;
        description: string;
        amount: string;
        dateTime: string;
    };
    onPress: () => void;
};

export default function TransactionBreakdownCard({ data, onPress }: TransactionBreakdownCardProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className='flex w-full flex-row items-center justify-between space-x-3.5 py-3.5'
        >
            <View className='relative items-center justify-center flex flex-row space-x-2.5'>
                <View className='flex items-center justify-center rounded-full bg-purple-100 px-2 py-1'>
                    <Text style={GLOBAL_STYLESHEET.suprapower} className='text-xs'>
                        89%
                    </Text>
                </View>

                <Text style={GLOBAL_STYLESHEET.suprapower} className='sm'>
                    {truncateStringIfLongerThan(data.category, 30)}
                </Text>
            </View>

            <Text
                style={[
                    GLOBAL_STYLESHEET.suprapower,
                    { color: data.type === 'debit' ? '#DC2626' : 'rgb(22 163 74)' },
                ]}
                className='text-xs'
            >
                {data.type === 'debit' ? '-' : '+'}
                {data.amount}
            </Text>
        </TouchableOpacity>
    );
}
