import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { Text, TouchableOpacity, View } from '../../Shared/styled';
import { Plan } from '../schema';
import { formatCurrencyAccurate } from '@/lib/utils/number';

export default function SavingPlanCard({ data, index }: { data: Plan; index: number }) {
    return (
        <TouchableOpacity
            className='p-4 border border-purple-200 rounded-xl flex flex-col w-72 space-y-2.5'
            style={{
                marginLeft: index !== 0 ? 20 : 0,
            }}
            onLongPress={() => alert('Chale chale you be broke')}
        >
            <View className='flex flex-row w-full justify-between items-center'>
                <Text
                    style={{
                        fontFamily: 'Suprapower',
                    }}
                    className='text-base text-black'
                >
                    {data.category}
                </Text>

                <View className='rounded-full bg-purple-600 px-2.5 py-0.5'>
                    <Text
                        style={GLOBAL_STYLESHEET.suprapower}
                        className='text-xs text-purple-50 tracking-tighter'
                    >
                        {`${(data.balance / data.target || 0) * 100}%`}
                    </Text>
                </View>
            </View>

            <Text style={GLOBAL_STYLESHEET.suprapower} className='text-base text-black'>
                {data.name}
            </Text>

            <View className='h-[1px] bg-purple-200 w-full' />

            <View className='flex flex-row justify-between items-center'>
                <Text
                    style={{
                        fontFamily: 'InterBold',
                    }}
                    className='text-sm text-black tracking-tighter'
                >
                    {formatCurrencyAccurate(data.currency, data.balance)}
                </Text>

                <Text
                    style={{
                        fontFamily: 'InterBold',
                    }}
                    className='text-sm text-gray-600 tracking-tighter'
                >
                    {formatCurrencyAccurate(data.currency, data.target)}
                </Text>
            </View>

            <View className='flex flex-row items-center space-x-0.5'>
                <View
                    className='h-2 bg-purple-600 rounded-md'
                    style={{
                        width: `${(data.balance / data.target) * 100}%`,
                    }}
                />
                <View className='h-2 flex-grow bg-purple-200 rounded-full' />
            </View>
        </TouchableOpacity>
    );
}
