import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { Text, View } from '../../Shared/styled';
import { PlanTransaction } from '../schema';

type TransactionHistoryCardProps = {
    data: PlanTransaction;
};

export default function PlanTransactionHistoryCard({ data }: TransactionHistoryCardProps) {
    return (
        <View className='flex flex-row justify-between items-center flex-grow'>
            <View className='flex flex-col'>
                <Text style={GLOBAL_STYLESHEET.suprapower} className='text-base'>
                    {data.amount}
                </Text>
                <Text
                    style={GLOBAL_STYLESHEET.monaSansSemiBold}
                    className='text-sm text-gray-500 tracking-tighter'
                >
                    {new Date(data.CreatedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    })}
                </Text>
            </View>
        </View>
    );
}

PlanTransactionHistoryCard.defaultProps = {
    showTitle: true,
};
