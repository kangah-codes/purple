import { LinearGradient, Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { useCallback } from 'react';
import { PieChart } from 'react-native-gifted-charts';

type ExpensesCardProps = {
    accountCurrency: string;
    accountBalance: number;
    accountName: string;
    cardBackgroundColour: string;
    cardTintColour: string;
};

export default function BudgetInfoCard() {
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
        <LinearGradient
            className='w-full p-5 rounded-2xl flex flex-col justify-center space-y-4 relative'
            // style={{ backgroundColor: item.cardBackgroundColour }}
            colors={['#c084fc', '#9333ea']}
        >
            <View className='flex flex-col'>
                <Text style={GLOBAL_STYLESHEET.suprapower} className='text-white text-5xl'>
                    100%
                </Text>
                <View className='flex flex-col space-y-1.5'>
                    <Text
                        style={GLOBAL_STYLESHEET.interSemiBold}
                        className='text-white text-sm tracking-tighter'
                    >
                        of total budget spent
                    </Text>
                    <Text
                        style={GLOBAL_STYLESHEET.interSemiBold}
                        className='text-white text-sm tracking-tighter truncate'
                    >
                        120,000 / GHS 240,000
                    </Text>
                </View>
            </View>

            <View className='border-b border-purple-300 w-full' />

            <View className='w-full items-start'>
                <Text
                    style={GLOBAL_STYLESHEET.interSemiBold}
                    className='text-white text-sm tracking-tighter truncate'
                >
                    You're still on track for this month's expenses.
                </Text>
            </View>
        </LinearGradient>
    );
}
