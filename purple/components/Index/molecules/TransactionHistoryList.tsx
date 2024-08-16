import { ChevronRightIcon } from '@/components/SVG/16x16';
import CustomBottomSheetModal from '@/components/Shared/molecules/GlobalBottomSheetModal';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import {
    CategoryIcon,
    ReceiptDetail,
    ReceiptHeader,
} from '@/components/Transactions/molecules/Receipt';
import TransactionHistoryCard from '@/components/Transactions/molecules/TransactionHistoryCard';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { ZIGZAG_VIEW } from '@/constants/ZigZagView';
import { keyExtractor } from '@/lib/utils/number';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { FlatList, Platform, StyleSheet } from 'react-native';
import Svg from 'react-native-svg';
import { transactionData } from '../constants';

const snapPoints = ['55%', '70%', '90%'];
const linearGradient = ['#c084fc', '#9333ea'];
const drawerBackground = Platform.OS === 'android' ? '#F3F4F6' : '#fff';

export default function TransactionHistoryList() {
    const { setShowBottomSheetModal } = useBottomSheetModalStore();

    const renderItem = useCallback(
        ({ item }: any) => (
            <TransactionHistoryCard
                data={item}
                onPress={() => setShowBottomSheetModal('transactionReceipt', true)}
            />
        ),
        [],
    );
    const renderItemSeparator = useCallback(
        () => <View className='border-b border-gray-100' />,
        [],
    );

    return (
        <>
            <CustomBottomSheetModal
                modalKey='transactionReceipt'
                snapPoints={snapPoints}
                style={styles.customBottomSheetModal}
                handleIndicatorStyle={styles.handleIndicator}
            >
                <View className='px-5'>
                    <View className='w-full items-center' style={styles.receiptView}>
                        <ReceiptHeader />
                        <Svg
                            height={12}
                            width='100%'
                            style={styles.zigZag}
                            fill='#c084fc'
                            stroke='#c084fc'
                        >
                            {ZIGZAG_VIEW}
                        </Svg>
                        <LinearGradient
                            className='w-full py-5 items-center justify-center'
                            colors={linearGradient}
                        >
                            <CategoryIcon />
                            <Text
                                style={GLOBAL_STYLESHEET.suprapower}
                                className='text-lg text-white'
                            >
                                🏠 Rent
                            </Text>
                        </LinearGradient>
                        <View className='w-full p-5 items-center' style={styles.bottomDrawer}>
                            <Text
                                style={GLOBAL_STYLESHEET.suprapower}
                                className='text-3xl text-black mb-5'
                            >
                                $69.42
                            </Text>
                            <View className='border-b border-gray-200 w-full mb-5' />
                            <ReceiptDetail label='Category' value='🏠 Rent' />
                            <ReceiptDetail label='Note' value='Payment for the month of June' />
                            <ReceiptDetail
                                label='Date'
                                value='Monday, June 9th 2024, at 12:00 PM70'
                            />
                        </View>
                        <Svg
                            height={12}
                            width='100%'
                            fill={drawerBackground}
                            stroke={drawerBackground}
                        >
                            {ZIGZAG_VIEW}
                        </Svg>
                    </View>
                </View>
            </CustomBottomSheetModal>
            <View className='flex flex-col mt-5'>
                <View className='flex flex-row w-full justify-between items-center'>
                    <Text style={GLOBAL_STYLESHEET.suprapower} className='text-base text-black'>
                        Transaction History
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.push('/transactions')}
                        className='flex flex-row items-center space-x-1'
                    >
                        <Text
                            style={GLOBAL_STYLESHEET.interSemiBold}
                            className='text-sm tracking-tighter text-purple-700'
                        >
                            View All
                        </Text>
                        <ChevronRightIcon stroke='#9333ea' />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={transactionData}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={styles.flatlistContainerStyle}
                    showsVerticalScrollIndicator={true}
                    renderItem={renderItem}
                    ItemSeparatorComponent={renderItemSeparator}
                    scrollEnabled={false}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    zigZag: {
        transform: [{ rotate: '180deg' }],
    },
    customBottomSheetModal: {
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
    },
    handleIndicator: {
        backgroundColor: '#D4D4D4',
    },
    receiptView: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.125,
        shadowRadius: 20,
        elevation: 5,
    },
    flatlistContainerStyle: {
        paddingBottom: 200,
    },
    bottomDrawer: {
        backgroundColor: Platform.OS === 'android' ? '#F3F4F6' : 'white',
    },
    arrowRight: {
        position: 'absolute',
    },
});
