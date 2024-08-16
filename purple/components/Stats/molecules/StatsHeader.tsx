import { Text, View } from '@/components/Shared/styled';
import React from 'react';
import StatsHeatmap from './Heatmap';
import TransactionsPieChart from './TransactionsPieChart';

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
                <View className='w-full space-y-2.5 border border-gray-200 rounded-xl p-5'>
                    <Text style={{ fontFamily: 'Suprapower' }}>Savings this month</Text>

                    <>
                        <Text
                            style={{ fontFamily: 'Suprapower' }}
                            className='text-2xl text-purple-700'
                        >
                            GHS 1,000.00
                        </Text>
                        <Text
                            style={{ fontFamily: 'Suprapower' }}
                            className='text-sm tracking-tighter text-gray-400'
                        >
                            / GHS 2,000.00
                        </Text>
                    </>

                    <View className='flex flex-row items-center space-x-0.5'>
                        <View className='h-2 w-10 bg-purple-600 rounded-md' />
                        <View className='h-2 flex-grow bg-purple-200 rounded-full' />
                    </View>
                </View>

                <View style={{ marginTop: 20 }} />
            </View>
        </>
    );
}
