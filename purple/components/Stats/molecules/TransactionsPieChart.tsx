import { PieChart } from 'react-native-gifted-charts';
import { View, Text } from '@/components/Shared/styled';
import { memo, useCallback } from 'react';

function TransactionsPieChart() {
    const pieData = [
        // { value: 40, color: "#C084FC", gradientCenterColor: "#E9D5FF" },
        { value: 54, color: '#A855F7', gradientCenterColor: '#E9D5FF' },
        { value: 20, color: '#6B21A8', gradientCenterColor: '#E9D5FF' },
    ];
    const centerLabelComponent = useCallback(() => {
        const highestValue = pieData.reduce((acc, curr) => Math.max(acc, curr.value), 0);
        const total = pieData.reduce((acc, curr) => acc + curr.value, 0);

        return (
            <Text style={{ fontSize: 30, fontFamily: 'Suprapower' }}>
                {Math.round((highestValue / total) * 100) + '%'}
            </Text>
        );
    }, []);

    return (
        <View className='flex items-center justify-between flex-row space-x-5 h-[160] mt-5'>
            <PieChart
                donut
                radius={80}
                innerRadius={60}
                data={pieData}
                centerLabelComponent={centerLabelComponent}
                showGradient
            />

            <View className='flex flex-col flex-grow rounded-lg h-full space-y-5 items-center justify-center'>
                <View className='flex flex-col'>
                    <View className='flex flex-row items-center space-x-1.5'>
                        <View className='w-2.5 h-2.5 rounded-full bg-[#A855F7]' />
                        <Text
                            style={{ fontFamily: 'InterMedium' }}
                            className='text-xs tracking-tighter'
                        >
                            Income
                        </Text>
                    </View>
                    <Text style={{ fontFamily: 'Suprapower' }} className='text-xl'>
                        3,046.09
                    </Text>
                </View>

                <View className='flex flex-col'>
                    <View className='flex flex-row items-center space-x-1.5'>
                        <View className='w-2.5 h-2.5 rounded-full bg-[#6B21A8]' />
                        <Text
                            style={{ fontFamily: 'InterMedium' }}
                            className='text-xs tracking-tighter'
                        >
                            Expenses
                        </Text>
                    </View>
                    <Text style={{ fontFamily: 'Suprapower' }} className='text-xl'>
                        3,046.09
                    </Text>
                </View>
            </View>
        </View>
    );
}

export default memo(TransactionsPieChart);
