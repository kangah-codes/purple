import { transactionData } from '@/components/Index/constants';
import { PlusIcon } from '@/components/SVG/24x24';
import {
    LinearGradient,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import { FlatList, Platform, StatusBar as RNStatusBar } from 'react-native';
import TransactionHistoryCard from '../molecules/TransactionHistoryCard';
import { router } from 'expo-router';
import { ArrowNarrowUpRightIcon } from '@/components/SVG/noscale';
import React, { memo, useCallback } from 'react';
import Svg, { Polygon } from 'react-native-svg';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import CustomBottomSheetModal from '@/components/Shared/molecules/GlobalBottomSheetModal';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { keyExtractor } from '@/lib/utils/number';

type TransactionsScreenProps = {
    showBackButton?: boolean;
};

function TransactionsScreen(props: TransactionsScreenProps) {
    const { showBackButton } = props;
    const { setShowBottomSheetModal } = useBottomSheetModalStore();

    const renderZigZagView = useCallback(() => {
        let nodes = [];
        const numberOfTeeth = 60; // Increase the number of teeth

        for (let i = 0; i < numberOfTeeth; i++) {
            const point = `${10 * i},0 ${10 * i + 5},10 ${10 * (i + 1)},0`; // Adjust the spacing between teeth
            nodes.push(<Polygon key={i} points={point} strokeWidth='2' />);
        }
        return nodes;
    }, []);
    const renderItem = useCallback(
        ({ item }: any) => (
            <TransactionHistoryCard
                data={item}
                onPress={() => setShowBottomSheetModal('transactionReceiptScreen', true)}
            />
        ),
        [],
    );
    const renderItemSeparator = useCallback(
        () => <View className='border-b border-gray-100' />,
        [],
    );

    return (
        <SafeAreaView className='bg-white relative h-full'>
            <ExpoStatusBar style='dark' />
            <CustomBottomSheetModal
                modalKey='transactionReceiptScreen'
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
                            <Svg
                                height={12}
                                width={'100%'}
                                style={{ transform: [{ rotate: '180deg' }] }}
                                fill='#c084fc'
                                stroke='#c084fc'
                            >
                                {renderZigZagView()}
                            </Svg>
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
                            <View
                                className='w-full p-5 flex flex-col items-center space-y-5 bg-white'
                                style={{
                                    backgroundColor:
                                        Platform.OS === 'android' ? '#F3F4F6' : 'white',
                                }}
                            >
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
                                        className='text-sm text-black'
                                    >
                                        Category
                                    </Text>
                                    <Text
                                        style={GLOBAL_STYLESHEET.interSemiBold}
                                        className='text-sm text-black tracking-tighter'
                                    >
                                        🏠 Rent
                                    </Text>
                                </View>

                                <View className='w-full flex flex-col justify-between'>
                                    <Text
                                        style={{ fontFamily: 'Suprapower' }}
                                        className='text-sm text-black'
                                    >
                                        Note
                                    </Text>
                                    <Text
                                        style={GLOBAL_STYLESHEET.interSemiBold}
                                        className='text-sm text-black tracking-tighter'
                                    >
                                        Payment for the month of June
                                    </Text>
                                </View>

                                <View className='w-full flex flex-col justify-between'>
                                    <Text
                                        style={{ fontFamily: 'Suprapower' }}
                                        className='text-sm text-black'
                                    >
                                        Date
                                    </Text>
                                    <Text
                                        style={GLOBAL_STYLESHEET.interSemiBold}
                                        className='text-sm text-black tracking-tighter'
                                    >
                                        Monday, June 9th 2024, at 12:00 PM
                                    </Text>
                                </View>
                            </View>
                            <Svg
                                height={12}
                                width={'100%'}
                                fill={Platform.OS === 'android' ? '#F3F4F6' : '#fff'}
                                stroke={Platform.OS === 'android' ? '#F3F4F6' : '#fff'}
                            >
                                {renderZigZagView()}
                            </Svg>
                        </View>
                    </View>
                </View>
            </CustomBottomSheetModal>
            <View
                style={{
                    paddingTop: RNStatusBar.currentHeight,
                }}
                className='bg-white'
            >
                {/* <View className='px-5 py-2.5'>
                    <Text style={{ fontFamily: 'Suprapower' }} className='text-lg'>
                        My Transactions
                    </Text>
                </View> */}

                <View className='w-full flex flex-row px-5 py-2.5 justify-between items-center'>
                    <View className='flex flex-col'>
                        <Text style={{ fontFamily: 'Suprapower' }} className='text-lg'>
                            My Transactions
                        </Text>
                    </View>

                    {showBackButton && (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text
                                style={GLOBAL_STYLESHEET.interSemiBold}
                                className='text-purple-600'
                            >
                                Back
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <FlatList
                    data={transactionData}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={{
                        paddingBottom: 100,
                        paddingHorizontal: 20,
                    }}
                    showsVerticalScrollIndicator={true}
                    renderItem={renderItem}
                    ItemSeparatorComponent={renderItemSeparator}
                />
            </View>

            {!showBackButton && (
                <LinearGradient
                    className='rounded-full  justify-center items-center space-y-4 absolute right-5 bottom-5'
                    colors={['#c084fc', '#9333ea']}
                >
                    <TouchableOpacity
                        className='items-center w-[55px] h-[55px] justify-center rounded-full p-3 '
                        onPress={() => {
                            router.push('/transactions/new-transaction');
                        }}
                    >
                        <PlusIcon stroke={'#fff'} />
                    </TouchableOpacity>
                </LinearGradient>
            )}
        </SafeAreaView>
    );
}

export default memo(TransactionsScreen);
