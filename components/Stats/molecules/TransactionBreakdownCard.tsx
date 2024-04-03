import { truncateStringIfLongerThan } from '@/utils/string';
import { ArrowNarrowDownRightIcon, ArrowNarrowUpRightIcon } from '../../SVG/icons';
import { Text, TouchableOpacity, View } from '../../Shared/styled';

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
            className='flex w-full flex-row items-center space-x-3.5 py-3.5'
        >
            <View className='relative items-center justify-center'>
                <View className='flex items-center justify-center rounded-full bg-purple-100 px-2 py-1'>
                    <Text style={{ fontFamily: 'Suprapower' }} className='text-xs'>
                        89%
                    </Text>
                </View>
            </View>

            <View className='flex flex-grow flex-col'>
                <View className='flex flex-row items-center justify-between'>
                    <Text style={{ fontFamily: 'Suprapower' }} className='sm'>
                        {truncateStringIfLongerThan(data.category, 30)}
                    </Text>
                    <Text
                        style={{
                            fontFamily: 'Suprapower',
                            color: data.type === 'debit' ? '#DC2626' : 'rgb(22 163 74)',
                        }}
                        className='text-xs'
                    >
                        {data.type === 'debit' ? '-' : '+'}
                        {data.amount}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
