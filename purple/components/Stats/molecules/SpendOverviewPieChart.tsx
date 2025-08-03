import { Text, View } from '@/components/Shared/styled';
import { Transaction } from '@/components/Transactions/schema';
import { satoshiFont } from '@/lib/constants/fonts';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { formatCurrencyRounded } from '@/lib/utils/number';
import React from 'react';
import { PieChart } from 'react-native-gifted-charts';

type SpendOverviewPieChartProps = {
    transactions: Transaction[];
};

function groupByCurrency(transactions: Transaction[]) {
    return transactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
        if (!acc[tx.currency]) acc[tx.currency] = [];
        acc[tx.currency].push(tx);
        return acc;
    }, {});
}

function groupByCategory(transactions: Transaction[]) {
    return transactions.reduce<Record<string, { value: number; color: string }>>((acc, tx) => {
        if (tx.type !== 'debit') return acc;
        if (!acc[tx.category]) {
            // Assign a color based on category hash (simple deterministic color)
            const hash = Array.from(tx.category).reduce((a, c) => a + c.charCodeAt(0), 0);
            const color = `hsl(${hash % 360}, 70%, 60%)`;
            acc[tx.category] = { value: 0, color };
        }
        acc[tx.category].value += Math.abs(tx.amount);
        return acc;
    }, {});
}

export default function SpendOverviewPieChart({ transactions }: SpendOverviewPieChartProps) {
    const byCurrency = groupByCurrency(transactions);

    return (
        <View className='px-5'>
            <View className='p-5 rounded-3xl flex flex-col space-y-2.5 bg-purple-50 border border-purple-200'>
                <Text className='text-base text-black' style={satoshiFont.satoshiBlack}>
                    Spend Breakdown
                </Text>
                {Object.entries(byCurrency).map(([currency, txs]) => {
                    const categoryMap = groupByCategory(txs);
                    const data = Object.entries(categoryMap).map(([name, { value, color }]) => ({
                        name,
                        value,
                        color,
                    }));

                    if (data.length === 0) return null;

                    return (
                        <View
                            key={currency}
                            className='flex items-center justify-between flex-row space-x-5 h-[160] mt-5'
                        >
                            <PieChart
                                donut
                                radius={80}
                                innerRadius={70}
                                data={data.map((item) => ({
                                    value: item.value,
                                    color: item.color,
                                }))}
                                showGradient
                                centerLabelComponent={() => (
                                    <View className='flex flex-col items-center justify-center h-full'>
                                        <Text
                                            style={GLOBAL_STYLESHEET.satoshiBold}
                                            className='text-sm text-purple-500'
                                        >
                                            Spent
                                        </Text>
                                        <Text
                                            style={GLOBAL_STYLESHEET.satoshiBlack}
                                            className='text-base text-purple-600'
                                        >
                                            {formatCurrencyRounded(
                                                data.reduce((sum, item) => sum + item.value, 0),
                                                currency,
                                            )}
                                        </Text>
                                    </View>
                                )}
                            />

                            <View className='flex flex-col flex-grow rounded-lg h-full space-y-2.5 items-start justify-center'>
                                {data.map((item) => (
                                    <View key={item.name} className='flex flex-col'>
                                        <View className='flex flex-row items-center space-x-1.5 justify-start'>
                                            <View
                                                className={`w-2 h-2 rounded-full`}
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <Text
                                                style={GLOBAL_STYLESHEET.satoshiBold}
                                                className='text-sm'
                                            >
                                                {item.name}
                                            </Text>
                                        </View>
                                        <Text
                                            style={GLOBAL_STYLESHEET.satoshiBlack}
                                            className='text-base'
                                        >
                                            {formatCurrencyRounded(item.value, currency)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
