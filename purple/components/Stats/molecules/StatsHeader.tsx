import { Text, View } from '@/components/Shared/styled';
import React from 'react';
import StatsHeatmap from './Heatmap';
import TransactionsPieChart from './TransactionsPieChart';
import SpendTrendAreaChart from './SpendTrendAreaChart';
import MonthSavings from './MonthSavings';
import { StyleSheet } from 'react-native';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';

export default function StatsHeader() {
    return (
        <>
            <View className='flex flex-col space-y-5 px-5'>
                {/* Daily Activity Section */}
                <View className='space-y-2.5'>
                    <Text className='text-base text-black' style={GLOBAL_STYLESHEET.gramatikaBlack}>
                        Daily Activity
                    </Text>
                    <StatsHeatmap />
                </View>

                {/* Spend Overview Section */}
                <View
                    className='space-y-5 border border-purple-200 rounded-3xl p-5 bg-white'
                    style={styles.card}
                >
                    <Text className='text-base text-black' style={GLOBAL_STYLESHEET.gramatikaBlack}>
                        Spend Overview
                    </Text>
                    <TransactionsPieChart />
                </View>

                {/* Savings Overview Section */}
                <View>
                    <MonthSavings />
                </View>

                {/* Spend Overview Section */}

                <View className='space-y-5 border border-purple-200 rounded-3xl px-5 pt-5'>
                    <Text className='text-sm text-black' style={GLOBAL_STYLESHEET.gramatikaBlack}>
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

const styles = StyleSheet.create({
    card: {
        shadowColor: '#A855F7',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.125,
        shadowRadius: 80,
        elevation: 3,
    },
});
