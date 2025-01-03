import { useGetAccountFromStore } from '@/components/Accounts/utils';
import CustomBottomSheetModal from '@/components/Shared/molecules/GlobalBottomSheetModal';
import { LinearGradient, Text, View } from '@/components/Shared/styled';
import { useTransactionStore } from '@/components/Transactions/hooks';
import { ReceiptDetail } from '@/components/Transactions/molecules/Receipt';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { ZIGZAG_VIEW } from '@/constants/ZigZagView';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import { extractEmojiOrDefault, isNotEmptyString } from '@/lib/utils/string';
import React, { useMemo } from 'react';
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

    const account = useGetAccountFromStore(currentTransaction.account_id);
    const transactionDate = useMemo(
        () => formatDateTime(currentTransaction.CreatedAt),
        [currentTransaction?.CreatedAt],
    );

    console.log(currentTransaction);

    return (
        <CustomBottomSheetModal
            modalKey={modalKey}
            snapPoints={snapPoints}
            style={styles.customBottomSheetModal}
            handleIndicatorStyle={styles.handleIndicator}
        >
            <View className='px-5'>
                <View className='w-full items-center mt-5' style={styles.receiptView}>
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
                        <View
                            style={styles.categoryIcon}
                            className='relative items-center justify-center flex rounded-xl h-10 w-10 border border-purple-200 bg-purple-50'
                        >
                            <Text className='absolute text-lg'>
                                {extractEmojiOrDefault(currentTransaction.category, '❔')}
                            </Text>
                        </View>
                        <Text
                            style={GLOBAL_STYLESHEET.gramatikaBlack}
                            className='text-lg text-white mt-2.5'
                        >
                            {currentTransaction.category.split(' ').slice(1).join(' ')}
                        </Text>
                    </LinearGradient>
                    <View className='w-full p-5 items-center' style={styles.bottomDrawer}>
                        <Text
                            style={[
                                GLOBAL_STYLESHEET.gramatikaBlack,
                                {
                                    color:
                                        currentTransaction.Type === 'debit'
                                            ? '#DC2626'
                                            : currentTransaction.Type === 'credit'
                                            ? 'rgb(22 163 74)'
                                            : '#9333EA',
                                },
                            ]}
                            className='text-3xl mb-5'
                        >
                            {currentTransaction.Type == 'debit'
                                ? '-'
                                : currentTransaction.Type == 'credit'
                                ? '+'
                                : ''}
                            {formatCurrencyAccurate(
                                currentTransaction.currency,
                                currentTransaction.amount,
                            )}
                        </Text>
                        <View className='w-full relative flex items-center justify-center'>
                            {/** The little wedges in the receipt */}
                            <View className='h-5 w-5 bg-white absolute -left-[30] -top-[10] rounded-full' />
                            <View className='h-5 w-5 bg-white absolute -right-[30] -top-[10] rounded-full' />
                            <View className='border-b border-gray-200 w-full mb-5' />
                        </View>
                        {/* <ReceiptDetail label='Category' value={currentTransaction.category} /> */}
                        {isNotEmptyString(currentTransaction.note) && (
                            <ReceiptDetail label='Note' value={currentTransaction.note} />
                        )}

                        <ReceiptDetail
                            label='Date'
                            value={`${transactionDate.date} at ${transactionDate.time}`}
                        />

                        <ReceiptDetail label='Account' value={account?.name} />
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
            height: 2,
        },
        shadowOpacity: 0.125,
        shadowRadius: 20,
        elevation: 50,
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
    categoryIcon: {
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
