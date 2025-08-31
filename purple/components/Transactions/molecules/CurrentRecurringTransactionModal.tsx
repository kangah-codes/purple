import { useAccountStore } from '@/components/Accounts/hooks';
import { EditSquareIcon, TrashIcon } from '@/components/SVG/icons/24x24';
import CustomBottomSheetModal from '@/components/Shared/molecules/GlobalBottomSheetModal';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { useDeleteTransaction, useTransactionStore } from '@/components/Transactions/hooks';
import { ReceiptDetail } from '@/components/Transactions/molecules/Receipt';
import { ZIGZAG_VIEW } from '@/lib/constants/ZigZagView';
import { satoshiFont } from '@/lib/constants/fonts';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { formatDateTime } from '@/lib/utils/date';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import { capitaliseFirstLetter, extractEmojiOrDefault } from '@/lib/utils/string';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Svg from 'react-native-svg';
import Toast from 'react-native-toast-message';
import { useQueryClient } from 'react-query';
import { ruleToText } from '../utils';

const snapPoints = ['55%', '70%', '90%'];
const linearGradient = ['#c084fc', '#9333ea'];
const drawerBackground = Platform.OS === 'android' ? '#faf5ff' : '#fff';

type CurrentRecurringTransactionModalProps = {
    modalKey: string;
};

export default function CurrentRecurringTransactionModal({
    modalKey,
}: CurrentRecurringTransactionModalProps) {
    const { currentRecurringTransaction, deleteTransaction } = useTransactionStore();
    const transactionDate = useMemo(
        () => formatDateTime(currentRecurringTransaction?.created_at ?? ''),
        [currentRecurringTransaction?.created_at],
    );
    const queryClient = useQueryClient();
    const { bottomSheetModalKeys, setShowBottomSheetModal } = useBottomSheetModalStore();
    const { mutate } = useDeleteTransaction({
        transactionID: currentRecurringTransaction?.id ?? '',
    });
    const { logEvent } = useAnalytics();
    const { accounts } = useAccountStore();
    const account = accounts.find((acc) => acc.id === currentRecurringTransaction?.account_id);

    useEffect(() => {
        const trackScreenView = async () => {
            if (bottomSheetModalKeys[modalKey]) {
                await logEvent('screen_view', {
                    screen: 'transaction_modal',
                    transaction: currentRecurringTransaction,
                });
            }
        };

        trackScreenView();
    }, [bottomSheetModalKeys, modalKey]);

    const deleteTransactionCb = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setShowBottomSheetModal(modalKey, false);
        mutate(undefined, {
            onError: () => {
                Toast.show({
                    type: 'error',
                    props: {
                        text1: 'Error!',
                        text2: 'There was an issue deleting transaction',
                    },
                });
                setShowBottomSheetModal(modalKey, false);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['transactions', 'accounts', 'user'] });
                deleteTransaction(currentRecurringTransaction?.id ?? '');
                Toast.show({
                    type: 'success',
                    props: {
                        text1: 'Success!',
                        text2: 'Transaction deleted successfully',
                    },
                });
            },
        });
    }, []);

    if (!currentRecurringTransaction || !account) return null;

    return (
        <CustomBottomSheetModal
            modalKey={modalKey}
            snapPoints={snapPoints}
            style={styles.customBottomSheetModal}
            handleIndicatorStyle={styles.handleIndicator}
        >
            <View className='px-5 relative'>
                <View className='w-full items-center' style={styles.receiptView}>
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
                        <View className='relative items-center justify-center flex rounded-xl h-10 w-10 bg-purple-50'>
                            <Text className='absolute text-lg'>
                                {extractEmojiOrDefault(currentRecurringTransaction.category, '❔')}
                            </Text>
                        </View>
                        <Text
                            style={satoshiFont.satoshiBlack}
                            className='text-lg text-white mt-2.5'
                        >
                            {currentRecurringTransaction.category.includes(' ')
                                ? currentRecurringTransaction.category.split(' ').slice(1).join(' ')
                                : currentRecurringTransaction.category}
                        </Text>
                    </LinearGradient>
                    <View className='w-full p-5 items-center' style={styles.bottomDrawer}>
                        <Text
                            style={[
                                satoshiFont.satoshiBlack,
                                {
                                    color:
                                        currentRecurringTransaction.type === 'debit'
                                            ? '#DC2626'
                                            : currentRecurringTransaction.type === 'credit'
                                            ? 'rgb(22 163 74)'
                                            : '#9333EA',
                                },
                            ]}
                            className='text-3xl mb-5 text-center'
                        >
                            {currentRecurringTransaction.type == 'debit'
                                ? '-'
                                : currentRecurringTransaction.type == 'credit'
                                ? '+'
                                : ''}
                            {formatCurrencyAccurate(
                                account.currency,
                                currentRecurringTransaction.amount,
                            )}
                        </Text>
                        <View className='w-full relative flex items-center justify-center'>
                            {/** The little wedges in the receipt */}
                            <View className='h-5 w-5 bg-white absolute -left-[30] -top-[10] rounded-full' />
                            <View className='h-5 w-5 bg-white absolute -right-[30] -top-[10] rounded-full' />
                            <View className='border-b border-purple-100 w-full mb-5' />
                        </View>
                        <ReceiptDetail
                            label='Schedule'
                            value={capitaliseFirstLetter(
                                ruleToText(currentRecurringTransaction.recurrence_rule),
                            )}
                        />
                        <ReceiptDetail label='Account' value={account.name} />
                        <View className='border-b border-purple-100 w-full mb-5' />
                        <View
                            // colors={['#c084fc', '#9333ea']}
                            className='rounded-full p-2 flex flex-row space-x-2 w-[60%] justify-between bg-purple-200 border border-purple-300'
                        >
                            <LinearGradient
                                colors={['#c084fc', '#9333ea']}
                                className='flex-grow flex items-center justify-center rounded-full'
                            >
                                <TouchableOpacity
                                    className='w-full py-2 flex items-center'
                                    onPress={() => {
                                        setShowBottomSheetModal(modalKey, false);
                                        router.push({
                                            pathname: '/transactions/edit-transaction',
                                        });
                                    }}
                                >
                                    <EditSquareIcon stroke={'#fff'} />
                                </TouchableOpacity>
                            </LinearGradient>

                            <LinearGradient
                                colors={['#ff6467', '#e7000b']}
                                className='flex-grow flex items-center justify-center rounded-full'
                            >
                                <TouchableOpacity
                                    className='w-full py-2 flex items-center'
                                    onLongPress={deleteTransactionCb}
                                    delayLongPress={500}
                                    onPress={() => {
                                        Toast.show({
                                            type: 'info',
                                            props: {
                                                text1: 'Hold to delete',
                                                text2: 'Press and hold to delete this transaction',
                                            },
                                        });
                                    }}
                                >
                                    <TrashIcon stroke={'#fff'} />
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
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
        backgroundColor: Platform.OS === 'android' ? '#faf5ff' : 'white',
    },
    arrowRight: {
        position: 'absolute',
    },
});
