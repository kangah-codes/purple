import CustomBottomSheetModal from '@/components/Shared/molecules/GlobalBottomSheetModal';
import { LinearGradient, Text, View } from '@/components/Shared/styled';
import { useTransactionStore } from '@/components/Transactions/hooks';
import {
    CategoryIcon,
    ReceiptDetail,
    ReceiptHeader,
} from '@/components/Transactions/molecules/Receipt';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { ZIGZAG_VIEW } from '@/constants/ZigZagView';
import { formatDate } from '@/lib/utils/date';
import { isNotEmptyString } from '@/lib/utils/string';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import Svg from 'react-native-svg';

const snapPoints = ['55%', '70%', '90%'];
const linearGradient = ['#c084fc', '#9333ea'];
const drawerBackground = Platform.OS === 'android' ? '#F3F4F6' : '#fff';

type CurrentTransactionModalProps = {
    modalKey: string;
};

export default function CurrentTransactionModal({ modalKey }: CurrentTransactionModalProps) {
    const { currentTransaction } = useTransactionStore();

    if (!currentTransaction) return null;

    return (
        <CustomBottomSheetModal
            modalKey={modalKey}
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
                        <CategoryIcon type={currentTransaction.Type} />
                        <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg text-white'>
                            {currentTransaction.category}
                        </Text>
                    </LinearGradient>
                    <View className='w-full p-5 items-center' style={styles.bottomDrawer}>
                        <Text
                            style={GLOBAL_STYLESHEET.suprapower}
                            className='text-3xl text-black mb-5'
                        >
                            {currentTransaction.amount}
                        </Text>
                        <View className='border-b border-gray-200 w-full mb-5' />
                        <ReceiptDetail label='Category' value={currentTransaction.category} />
                        {isNotEmptyString(currentTransaction.note) && (
                            <ReceiptDetail label='Note' value={currentTransaction.note} />
                        )}

                        <ReceiptDetail
                            label='Date'
                            value={formatDate(currentTransaction.created_at, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                            })}
                        />
                    </View>
                    <Svg height={12} width='100%' fill={drawerBackground} stroke={drawerBackground}>
                        {ZIGZAG_VIEW}
                    </Svg>
                </View>
            </View>
        </CustomBottomSheetModal>
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
