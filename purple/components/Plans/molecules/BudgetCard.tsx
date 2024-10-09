import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { BudgetPlan, Plan } from '../schema';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { formatDate } from '@/lib/utils/date';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { useAuth } from '@/components/Auth/hooks';
import { formatCurrencyAccurate } from '@/lib/utils/number';

type BudgetCardProps = {
    data: Plan;
};

export default function BudgetPlanCard({ data }: BudgetCardProps) {
    const { category, start_date, end_date, balance, target, name, currency } = data;
    const { sessionData } = useAuth();

    return (
        <View className='p-4 border border-gray-200 rounded-2xl flex flex-col space-y-2.5 w-full'>
            <View className='flex flex-row w-full justify-between items-center'>
                <Text style={GLOBAL_STYLESHEET.suprapower} className='text-base text-black'>
                    {category}
                </Text>
            </View>

            <View className='flex flex-row w-full justify-between items-center'>
                <Text style={GLOBAL_STYLESHEET.suprapower} className='text-base text-black'>
                    {truncateStringIfLongerThan(name, 20)}
                </Text>
            </View>

            <View className='flex flex-col space-y-2.5'>
                <View className='flex flex-row items-center space-x-0.5'>
                    <View
                        className='h-2 bg-purple-600 rounded-md'
                        style={{
                            width: `${(balance / target) * 100}%`,
                        }}
                    />
                    <View className='h-2 flex-grow bg-purple-200 rounded-full' />
                </View>

                <View className='flex flex-row justify-between items-center'>
                    <Text
                        style={GLOBAL_STYLESHEET.interMedium}
                        className='text-sm text-black tracking-tighter'
                    >
                        {formatDate(start_date, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })}
                    </Text>

                    <Text
                        style={GLOBAL_STYLESHEET.interMedium}
                        className='text-sm text-gray-600 tracking-tighter'
                    >
                        {formatDate(end_date, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </Text>
                </View>
            </View>

            <View className='h-[1.5px] bg-purple-50 w-full' />

            <View className='bg-purple-50 p-3.5 rounded-xl space-y-2.5 flex flex-col'>
                <View className='flex flex-row justify-between items-center'>
                    <Text
                        style={GLOBAL_STYLESHEET.interBold}
                        className='text-sm text-gray-700 tracking-tight'
                    >
                        Spent
                    </Text>
                    <Text
                        style={GLOBAL_STYLESHEET.interSemiBold}
                        className='text-sm text-black tracking-tighter'
                    >
                        {formatCurrencyAccurate(currency, target - balance)}
                    </Text>
                </View>
                <View className='border-b border-purple-200 w-full' />
                <View className='flex flex-row justify-between items-center'>
                    <Text
                        style={GLOBAL_STYLESHEET.interBold}
                        className='text-sm text-gray-700 tracking-tight'
                    >
                        Balance
                    </Text>
                    <Text
                        style={GLOBAL_STYLESHEET.interSemiBold}
                        className='text-sm text-gray-700 tracking-tight'
                    >
                        {formatCurrencyAccurate(currency, balance)}
                    </Text>
                </View>
                <View className='border-b border-purple-200 w-full' />
                <View className='flex flex-row justify-between items-center'>
                    <Text
                        style={GLOBAL_STYLESHEET.interBold}
                        className='text-sm text-gray-700 tracking-tight'
                    >
                        Budget
                    </Text>
                    <Text
                        style={GLOBAL_STYLESHEET.interSemiBold}
                        className='text-sm text-black tracking-tighter'
                    >
                        {formatCurrencyAccurate(currency, target)}
                    </Text>
                </View>
            </View>
        </View>
    );
}
