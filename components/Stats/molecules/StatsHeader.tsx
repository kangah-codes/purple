import { Text, View } from '@/components/Shared/styled';
import React from 'react';
import StatsHeatmap from './Heatmap';
import TransactionsPieChart from './TransactionsPieChart';

export default function StatsHeader() {
    return (
        <>
            <View className='flex flex-col space-y-5'>
                <View className='flex flex-col space-y-2.5'>
                    <Text className='text-sm text-black' style={{ fontFamily: 'Suprapower' }}>
                        Daily Activity
                    </Text>

                    <StatsHeatmap />
                </View>

                <View className='flex flex-col space-y-5 border border-gray-200 rounded-xl p-5'>
                    <Text className='text-sm text-black' style={{ fontFamily: 'Suprapower' }}>
                        Spend Overview
                    </Text>
                    <View className='h-[160]'>
                        <TransactionsPieChart />
                    </View>
                </View>

                <View className='flex flex-row justify-between space-x-5'>
                    <View className='flex w-full flex-col space-y-2.5 rounded-xl border border-gray-200 p-5'>
                        <View className='flex flex-row'>
                            <Text style={{ fontFamily: 'Suprapower' }} className=''>
                                Savings this month
                            </Text>
                        </View>

                        <View className='flex flex-col'>
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
                        </View>

                        <View className='flex flex-row justify-between space-x-0.5'>
                            <View className='h-2 w-10 rounded-md bg-purple-600' />

                            <View className='h-2 w-auto flex-grow bg-purple-200 rounded-full' />

                            {/* {new Array(30).fill(0).map((_, i) => (
                                                <View className='h-5 w-[1.3] bg-gray-400' key={i} />
                                            ))} */}
                        </View>
                    </View>
                </View>
                <View style={{ marginTop: 20 }} />
            </View>
        </>
    );
}
