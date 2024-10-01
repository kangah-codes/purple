import { truncateStringIfLongerThan } from '@/lib/utils/string';
import {
    ArrowNarrowDownRightIcon,
    ArrowNarrowRightIcon,
    ArrowNarrowUpRightIcon,
} from '../../SVG/noscale';
import { Text, TouchableOpacity, View } from '../../Shared/styled';
import { Transaction, TransactionData } from '../schema';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';

type TransactionHistoryCardProps = {
    data: Transaction;
    onPress: () => void;
    showTitle?: boolean;
};

export default function TransactionHistoryCard({
    data,
    onPress,
    showTitle,
}: TransactionHistoryCardProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className='w-full py-3.5 flex flex-row items-center space-x-3.5'
        >
            <View className='relative items-center justify-center'>
                <View
                    className='flex items-center justify-center rounded-full h-9 w-9'
                    style={{
                        backgroundColor:
                            data.Type === 'debit'
                                ? '#FEE2E2'
                                : data.Type == 'credit'
                                ? 'rgb(220 252 231)'
                                : '#F3E8FF',
                    }}
                />
                {data.Type === 'debit' ? (
                    <ArrowNarrowUpRightIcon
                        width={16}
                        height={16}
                        style={{ position: 'absolute' }}
                        stroke={'#B91C1C'}
                    />
                ) : data.Type == 'credit' ? (
                    <ArrowNarrowDownRightIcon
                        width={16}
                        height={16}
                        style={{ position: 'absolute' }}
                        stroke={'#047857'}
                    />
                ) : (
                    <ArrowNarrowRightIcon
                        width={16}
                        height={16}
                        style={{ position: 'absolute' }}
                        stroke='#7C3AED'
                    />
                )}
            </View>

            <View className='flex flex-col flex-grow'>
                <View className='flex flex-row justify-between items-center'>
                    {showTitle && (
                        <Text style={GLOBAL_STYLESHEET.suprapower} className='text-base'>
                            {truncateStringIfLongerThan(data.category, 30)}
                        </Text>
                    )}
                    <Text
                        style={{
                            ...GLOBAL_STYLESHEET.suprapower,
                            color: data.Type === 'debit' ? '#DC2626' : 'rgb(22 163 74)',
                        }}
                        className='text-xs'
                    >
                        {data.Type === 'debit' ? '-' : '+'}
                        {data.amount}
                    </Text>
                </View>

                <View className='flex flex-row justify-between'>
                    <Text
                        style={GLOBAL_STYLESHEET.interSemiBold}
                        className='text-sm text-gray-600 tracking-tighter'
                    >
                        {truncateStringIfLongerThan(data.note ?? '', 25)}
                    </Text>
                    <Text
                        style={GLOBAL_STYLESHEET.interSemiBold}
                        className='text-sm text-gray-600 tracking-tighter'
                    >
                        {new Date(data.created_at).toLocaleDateString()}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

TransactionHistoryCard.defaultProps = {
    showTitle: true,
};
