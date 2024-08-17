import { transactionData } from '@/components/Index/constants';
import { PlusIcon } from '@/components/SVG/24x24';
import CustomBottomSheetModal from '@/components/Shared/molecules/GlobalBottomSheetModal';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import {
    LinearGradient,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { ZIGZAG_VIEW } from '@/constants/ZigZagView';
import { keyExtractor } from '@/lib/utils/number';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { memo, useCallback } from 'react';
import { FlatList, Platform, StyleSheet } from 'react-native';
import Svg from 'react-native-svg';
import { CategoryIcon, ReceiptDetail, ReceiptHeader } from '../molecules/Receipt';
import TransactionHistoryCard from '../molecules/TransactionHistoryCard';

type TransactionsScreenProps = {
    showBackButton?: boolean;
};

const linearGradient = ['#c084fc', '#9333ea'];
const drawerBackground = Platform.OS === 'android' ? '#F3F4F6' : '#fff';

function TransactionsScreen(props: TransactionsScreenProps) {
    const { showBackButton } = props;
    const { setShowBottomSheetModal } = useBottomSheetModalStore();
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
        <SafeAreaView className='bg-white relative h-full px-5'>
            <ExpoStatusBar style='dark' />
            <CustomBottomSheetModal
                modalKey='transactionReceiptScreen'
                snapPoints={['55%', '70%', '90%']}
                style={styles.bottomSheetModal}
                handleIndicatorStyle={styles.handleIndicator}
            >
                <View
                    className='w-full flex flex-col items-center px-5'
                    style={styles.receiptContainer}
                >
                    <ReceiptHeader />
                    <Svg
                        height={12}
                        width='100%'
                        style={styles.zigzag}
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
                        <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg text-white'>
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
                        <ReceiptDetail label='Date' value='Monday, June 9th 2024, at 12:00 PM70' />
                    </View>
                    <Svg height={12} width='100%' fill={drawerBackground} stroke={drawerBackground}>
                        {ZIGZAG_VIEW}
                    </Svg>
                </View>
            </CustomBottomSheetModal>
            <View className='w-full flex flex-row px-5 py-2.5 justify-between items-center'>
                <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg'>
                    My Transactions
                </Text>

                {showBackButton && (
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={GLOBAL_STYLESHEET.interSemiBold} className='text-purple-600'>
                            Back
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={transactionData}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={true}
                renderItem={renderItem}
                ItemSeparatorComponent={renderItemSeparator}
            />

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

const styles = StyleSheet.create({
    bottomSheetModal: {
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
    receiptContainer: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.125,
        shadowRadius: 20,
        elevation: 5,
    },
    zigzag: {
        transform: [{ rotate: '180deg' }],
    },
    receipt: {
        backgroundColor: Platform.OS === 'android' ? '#F3F4F6' : 'white',
    },
    bottomDrawer: {
        backgroundColor: Platform.OS === 'android' ? '#F3F4F6' : 'white',
    },
    contentContainer: {
        paddingBottom: 100,
        paddingHorizontal: 20,
    },
});
export default memo(TransactionsScreen);
