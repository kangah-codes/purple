import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { BudgetPlan } from '../schema';

type BudgetCardProps = {
    data: BudgetPlan;
};

export default function BudgetPlanCard(props: BudgetCardProps) {
    const { category, startDate, endDate, percentageCompleted, spent, balance, budget } =
        props.data;

    return (
        <View className='p-4 border border-purple-200 rounded-2xl flex flex-col space-y-5 w-full'>
            <View className='flex flex-row w-full justify-between items-center'>
                <Text
                    style={{
                        fontFamily: 'Suprapower',
                    }}
                    className='text-base text-black'
                >
                    {category}
                </Text>
            </View>

            <View className='flex flex-col space-y-1.5'>
                <View className='relative w-full'>
                    <View className='h-2 w-full rounded-full bg-purple-50' />
                    <View
                        className='h-2 bg-purple-600 rounded-full absolute'
                        style={{
                            width: `${percentageCompleted}%`,
                        }}
                    />
                </View>

                <View className='flex flex-row justify-between items-center'>
                    <Text
                        style={{
                            fontFamily: 'InterMedium',
                        }}
                        className='text-sm text-black tracking-tighter'
                    >
                        {startDate}
                    </Text>

                    <Text
                        style={{
                            fontFamily: 'InterMedium',
                        }}
                        className='text-sm text-gray-500 tracking-tighter'
                    >
                        {endDate}
                    </Text>
                </View>
            </View>

            <View className='h-[1.5px] bg-purple-50 w-full' />

            <View className='bg-purple-50 p-3.5 rounded-xl space-y-2.5 flex flex-col'>
                <View className='flex flex-row justify-between items-center'>
                    <Text
                        style={{
                            fontFamily: 'InterSemiBold',
                        }}
                        className='text-sm text-gray-700 tracking-tighter'
                    >
                        Spent
                    </Text>
                    <Text
                        style={{
                            fontFamily: 'Suprapower',
                        }}
                        className='text-sm text-black tracking-tighter'
                    >
                        GHS {spent}
                    </Text>
                </View>
                <View className='border-b border-purple-200 w-full' />
                <View className='flex flex-row justify-between items-center'>
                    <Text
                        style={{
                            fontFamily: 'InterSemiBold',
                        }}
                        className='text-sm text-gray-700 tracking-tighter'
                    >
                        Balance
                    </Text>
                    <Text
                        style={{
                            fontFamily: 'Suprapower',
                        }}
                        className='text-sm text-black tracking-tighter'
                    >
                        GHS {balance}
                    </Text>
                </View>
                <View className='border-b border-purple-200 w-full' />
                <View className='flex flex-row justify-between items-center'>
                    <Text
                        style={{
                            fontFamily: 'InterSemiBold',
                        }}
                        className='text-sm text-gray-700 tracking-tighter'
                    >
                        Total Budget
                    </Text>
                    <Text
                        style={{
                            fontFamily: 'Suprapower',
                        }}
                        className='text-sm text-black tracking-tighter'
                    >
                        GHS {budget}
                    </Text>
                </View>
            </View>
        </View>
    );
}
