import { transactionData } from '@/components/Index/constants';
import CustomBottomSheetFlatList from '@/components/Shared/molecules/GlobalBottomSheetFlatList';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import { SafeAreaView, Text, View } from '@/components/Shared/styled';
import TransactionHistoryCard from '@/components/Transactions/molecules/TransactionHistoryCard';
import { Portal } from '@gorhom/portal';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React, { useCallback } from 'react';
import { FlatList, StatusBar as RNStatusBar } from 'react-native';
import StatsHeader from '../molecules/StatsHeader';
import TransactionBreakdownCard from '../molecules/TransactionBreakdownCard';

export default function AccountsScreen() {
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();
    const itemSeparator = useCallback(() => <View className='border-b border-gray-100' />, []);
    const renderItem = useCallback(
        ({ item }: { item: any }) => (
            <TransactionHistoryCard showTitle={false} data={item} onPress={() => {}} />
        ),
        [],
    );
    const renderBreakdownItem = useCallback(
        ({ item }: { item: any }) => (
            <TransactionBreakdownCard
                data={item}
                onPress={() => setShowBottomSheetFlatList('statsTransactionBreakdownList', true)}
            />
        ),
        [],
    );

    return (
        <SafeAreaView className='relative h-full bg-white'>
            <ExpoStatusBar style='dark' />
            <Portal>
                <CustomBottomSheetFlatList
                    snapPoints={['50%', '70%']}
                    children={
                        <View className='px-5 py-2.5'>
                            <Text
                                style={{ fontFamily: 'Suprapower' }}
                                className='text-base text-gray-900'
                            >
                                🏠 Housing
                            </Text>
                        </View>
                    }
                    sheetKey={'statsTransactionBreakdownList'}
                    data={transactionData}
                    renderItem={renderItem}
                    containerStyle={{
                        paddingHorizontal: 20,
                    }}
                    handleIndicatorStyle={{
                        backgroundColor: '#D4D4D4',
                    }}
                    flatListContentContainerStyle={{
                        paddingBottom: 100,
                        paddingHorizontal: 20,
                        // paddingTop: 20,
                        backgroundColor: 'white',
                    }}
                />
            </Portal>

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
                    renderItem={renderBreakdownItem}
                    ItemSeparatorComponent={itemSeparator}
                    keyExtractor={(_, index) => index.toString()}
                    ListHeaderComponent={<StatsHeader />}
                />
            </View>
        </SafeAreaView>
    );
}
