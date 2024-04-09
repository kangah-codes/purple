import { transactionData } from '@/components/Index/constants';
import { LinearGradient, SafeAreaView, Text, View } from '@/components/Shared/styled';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { FlatList, StatusBar as RNStatusBar } from 'react-native';
import StatsHeatmap from '../molecules/Heatmap';
import TransactionBreakdownCard from '../molecules/TransactionBreakdownCard';
import TransactionsPieChart from '../molecules/TransactionsPieChart';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import React from 'react';
import CustomBottomSheetModal from '@/components/Shared/molecules/GlobalBottomSheetModal';
import { ArrowNarrowUpRightIcon } from '@/components/SVG/icons';

export default function AccountsScreen() {
    const { setShowBottomSheetModal } = useBottomSheetModalStore();

    return (
        <SafeAreaView className='relative h-full bg-white'>
            <ExpoStatusBar style='dark' />
            <CustomBottomSheetModal
                modalKey='statsTransactionBreakdownSheet'
                snapPoints={['55%', '70%', '90%']}
                style={{
                    backgroundColor: 'white',
                    borderRadius: 24,
                    shadowColor: '#000000',
                    shadowOffset: {
                        width: 0,
                        height: 8,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 48,
                    elevation: 10,
                }}
                handleIndicatorStyle={{
                    backgroundColor: '#D4D4D4',
                }}
            >
                <View className='px-5'>
                    <View
                        className='w-full flex flex-col space-y-5 items-center'
                        style={{
                            shadowColor: '#000',
                            shadowOffset: {
                                width: 0,
                                height: 1,
                            },
                            shadowOpacity: 0.125,
                            shadowRadius: 20,
                            elevation: 5,
                        }}
                    >
                        <View className='w-full flex flex-col space-y-0.5 items-center justify-center'>
                            <Text
                                style={{ fontFamily: 'Suprapower' }}
                                className='text-lg text-gray-700'
                            >
                                Receipt
                            </Text>
                        </View>

                        <View className='w-full flex flex-col'>
                            <LinearGradient
                                className='w-full py-5 flex items-center justify-center'
                                colors={['#c084fc', '#9333ea']}
                            >
                                <View className='flex flex-col items-center space-y-1.5'>
                                    <View className='p-5 bg-red-100 rounded-full relative flex items-center justify-center'>
                                        <ArrowNarrowUpRightIcon
                                            width={16}
                                            height={16}
                                            style={{ position: 'absolute' }}
                                            stroke={'#B91C1C'}
                                        />
                                    </View>
                                    <Text
                                        style={{ fontFamily: 'Suprapower' }}
                                        className='text-lg text-white'
                                    >
                                        🏠 Rent
                                    </Text>
                                </View>
                            </LinearGradient>
                            {/** Shadows don't seem to be working on Android, so just make the bg gray to make it stand out from the white bg */}
                            <View className='w-full p-5 flex flex-col items-center space-y-5 bg-white'>
                                <Text
                                    style={{ fontFamily: 'Suprapower' }}
                                    className='text-3xl text-black'
                                >
                                    $69.42
                                </Text>

                                <View className='border-b border-gray-200 w-full' />

                                <View className='w-full flex flex-col justify-between'>
                                    <Text
                                        style={{ fontFamily: 'Suprapower' }}
                                        className='text-sm text-gray-600'
                                    >
                                        Category
                                    </Text>
                                    <Text
                                        style={{ fontFamily: 'InterSemiBold' }}
                                        className='text-sm text-black tracking-tighter'
                                    >
                                        🏠 Rent
                                    </Text>
                                </View>

                                <View className='w-full flex flex-col justify-between'>
                                    <Text
                                        style={{ fontFamily: 'Suprapower' }}
                                        className='text-sm text-gray-600'
                                    >
                                        Note
                                    </Text>
                                    <Text
                                        style={{ fontFamily: 'InterSemiBold' }}
                                        className='text-sm text-black tracking-tighter'
                                    >
                                        Payment for the month of June
                                    </Text>
                                </View>

                                <View className='w-full flex flex-col justify-between'>
                                    <Text
                                        style={{ fontFamily: 'Suprapower' }}
                                        className='text-sm text-gray-600'
                                    >
                                        Date
                                    </Text>
                                    <Text
                                        style={{ fontFamily: 'InterSemiBold' }}
                                        className='text-sm text-black tracking-tighter'
                                    >
                                        Monday, June 9th 2024, at 12:00 PM
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </CustomBottomSheetModal>
            <View
                style={{
                    paddingTop: RNStatusBar.currentHeight,
                }}
                className='bg-white px-5'
            >
                <View className='flex flex-row items-center justify-between py-2.5'>
                    <Text style={{ fontFamily: 'Suprapower' }} className='text-lg'>
                        Stats
                    </Text>

                    {/* <TouchableOpacity onPress={alert}>
							<DotsVerticalIcon stroke={"#9CA3AF"} />
						</TouchableOpacity> */}
                </View>

                <FlatList
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    data={transactionData}
                    renderItem={({ item }) => (
                        <TransactionBreakdownCard
                            data={item}
                            onPress={() =>
                                setShowBottomSheetModal('statsTransactionBreakdownSheet', true)
                            }
                        />
                    )}
                    ItemSeparatorComponent={() => <View className='border-b border-gray-100' />}
                    keyExtractor={(_, index) => index.toString()}
                    ListHeaderComponent={() => (
                        <View className='flex flex-col space-y-5'>
                            <View className='flex flex-col space-y-2.5'>
                                <Text
                                    className='text-sm text-black'
                                    style={{ fontFamily: 'Suprapower' }}
                                >
                                    Daily Activity
                                </Text>

                                <StatsHeatmap />
                            </View>

                            <View className='flex flex-col space-y-2.5'>
                                <Text
                                    className='text-sm text-black'
                                    style={{ fontFamily: 'Suprapower' }}
                                >
                                    Spend Overview
                                </Text>
                                <View className='flex flex-col space-y-5'>
                                    <View className='h-[200] flex-1 rounded-xl border border-gray-200'>
                                        <TransactionsPieChart />
                                    </View>
                                </View>
                            </View>

                            <View className='flex flex-row justify-between space-x-5'>
                                <View className='flex w-[64%] flex-col space-y-2.5 rounded-xl border border-gray-200 p-5'>
                                    <View className='flex flex-row'>
                                        <Text style={{ fontFamily: 'Suprapower' }} className=''>
                                            Savings this month
                                        </Text>
                                    </View>

                                    <View className='flex flex-col'>
                                        <Text
                                            style={{ fontFamily: 'Suprapower' }}
                                            className='text-xl text-purple-700'
                                        >
                                            GHS 1,000.00
                                        </Text>
                                        <Text
                                            style={{ fontFamily: 'Suprapower' }}
                                            className='text-xs tracking-tighter text-gray-400'
                                        >
                                            / GHS 2,000.00
                                        </Text>
                                    </View>

                                    <View className='rounded-lg bg-gray-100 p-2'>
                                        <View className='flex flex-row justify-between'>
                                            <View className='h-5 w-10 rounded-md bg-purple-600' />

                                            {new Array(30).fill(0).map((_, i) => (
                                                <View className='h-5 w-[1.3] bg-gray-400' key={i} />
                                            ))}
                                        </View>
                                    </View>
                                </View>
                                <View className='flex w-[30%] flex-col space-y-5 rounded-xl border-gray-200'>
                                    <View className='w-full flex-1 items-center justify-center overflow-hidden rounded-xl border border-gray-200'>
                                        <Text
                                            style={{ fontFamily: 'Suprapower' }}
                                            className='text-xl text-purple-700'
                                        >
                                            100%
                                        </Text>
                                    </View>

                                    <View className='w-full flex-1 items-center justify-center overflow-hidden rounded-xl border border-gray-200'>
                                        <Text
                                            style={{ fontFamily: 'Suprapower' }}
                                            className='text-xl text-purple-700'
                                        >
                                            100%
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{ marginTop: 20 }} />
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}
