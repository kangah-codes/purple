import { Text, View } from '@/components/Shared/styled';
import React from 'react';
import StatsHeatmap from './Heatmap';
import TransactionsPieChart from './TransactionsPieChart';
import SpendTrendAreaChart from './SpendTrendAreaChart';
import MonthSavings from './MonthSavings';
import { StyleSheet } from 'react-native';

export default function StatsHeader() {
    return (
        <>
            <View className='flex flex-col space-y-5'>
                {/* Daily Activity Section */}
                <View className='space-y-2.5'>
                    <Text className='text-sm text-black' style={{ fontFamily: 'Suprapower' }}>
                        Daily Activity
                    </Text>
                    <StatsHeatmap />
                </View>

                {/* Spend Overview Section */}
                <View className='space-y-5 border border-gray-200 rounded-xl p-5'>
                    <Text className='text-sm text-black' style={{ fontFamily: 'Suprapower' }}>
                        Spend Overview
                    </Text>
                    <TransactionsPieChart />
                </View>

                {/* Savings Overview Section */}
                <View>
                    <MonthSavings />
                </View>

                {/* Spend Overview Section */}

                <View className='space-y-5 border border-gray-200 rounded-xl px-5 pt-5'>
                    <Text className='text-sm text-black' style={{ fontFamily: 'Suprapower' }}>
                        Spend Trend
                    </Text>

                    <View className=''>
                        <SpendTrendAreaChart />
                    </View>
                </View>

                <View style={{ marginTop: 20 }} />
            </View>
        </>
    );
}
