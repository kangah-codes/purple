import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { ArrowNarrowDownRightIcon, ArrowNarrowUpRightIcon } from '../../SVG/noscale';
import { Text, TouchableOpacity, View } from '../../Shared/styled';
import { TransactionData } from '../schema';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';

type TransactionHistoryCardProps = {
    data: TransactionData;
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
                        backgroundColor: data.type === 'debit' ? '#FEE2E2' : 'rgb(220 252 231)',
                    }}
                />
                {data.type === 'debit' ? (
                    <ArrowNarrowUpRightIcon
                        width={16}
                        height={16}
                        style={{ position: 'absolute' }}
                        stroke={'#B91C1C'}
                    />
                ) : (
                    <ArrowNarrowDownRightIcon
                        width={16}
                        height={16}
                        style={{ position: 'absolute' }}
                        stroke={'#047857'}
                    />
                )}
            </View>

            <View className='flex flex-col flex-grow'>
                <View className='flex flex-row justify-between items-center'>
                    {showTitle && (
                        <Text style={{ fontFamily: 'Suprapower' }} className='text-base'>
                            {truncateStringIfLongerThan(data.category, 30)}
                        </Text>
                    )}
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

                <View className='flex flex-row justify-between'>
                    <Text
                        style={GLOBAL_STYLESHEET.interSemiBold}
                        className='text-sm text-gray-600 tracking-tighter'
                    >
                        {truncateStringIfLongerThan(data.description, 25)}
                    </Text>
                    <Text
                        style={GLOBAL_STYLESHEET.interSemiBold}
                        className='text-sm text-gray-600 tracking-tighter'
                    >
                        {data.dateTime}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

TransactionHistoryCard.defaultProps = {
    showTitle: true,
};
