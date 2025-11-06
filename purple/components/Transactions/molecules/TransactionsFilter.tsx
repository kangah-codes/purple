import CustomBottomSheetModal from '@/components/Shared/molecules/GlobalBottomSheetModal';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import { LinearGradient, View, TouchableOpacity, Text } from '@/components/Shared/styled';
import {
    useDeleteTransaction,
    useInfiniteTransactions,
    useTransactionStore,
} from '@/components/Transactions/hooks';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { formatDateTime } from '@/lib/utils/date';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useQueryClient } from 'react-query';
import * as Haptics from 'expo-haptics';
import { satoshiFont } from '@/lib/constants/fonts';
import { ChevronDownIcon } from '@/components/SVG/icons/16x16';

const snapPoints = ['55%', '70%'];
const linearGradient = ['#c084fc', '#9333ea'];
const drawerBackground = Platform.OS === 'android' ? '#faf5ff' : '#fff';

export default function TransactionsFilter() {
    const { currentTransaction, deleteTransaction } = useTransactionStore();
    const transactionDate = useMemo(
        () => formatDateTime(currentTransaction?.created_at ?? ''),
        [currentTransaction?.created_at],
    );
    const { refetch } = useInfiniteTransactions({
        requestQuery: {
            page_size: 10,
        },
    });
    const queryClient = useQueryClient();
    const { bottomSheetModalKeys, setShowBottomSheetModal } = useBottomSheetModalStore();
    const { mutate } = useDeleteTransaction({
        transactionID: currentTransaction?.id ?? '',
    });
    const { logEvent } = useAnalytics();

    useEffect(() => {
        const trackScreenView = async () => {
            if (bottomSheetModalKeys['transactionsFilter']) {
                await logEvent('screen_view', {
                    screen: 'transaction_modal',
                    transaction: currentTransaction,
                });
            }
        };

        trackScreenView();
    }, [bottomSheetModalKeys]);

    const deleteTransactionCb = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setShowBottomSheetModal('transactionsFilter', false);
        mutate(undefined, {
            onError: () => {
                Toast.show({
                    type: 'error',
                    props: {
                        text1: 'Error!',
                        text2: 'There was an issue deleting transaction',
                    },
                });
                setShowBottomSheetModal('transactionsFilter', false);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['transactions', 'accounts', 'user'] });
                refetch();
                deleteTransaction(currentTransaction?.id ?? '');
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

    if (!currentTransaction) return null;

    return (
        <CustomBottomSheetModal
            modalKey={'transactionsFilter'}
            snapPoints={snapPoints}
            style={styles.customBottomSheetModal}
            handleIndicatorStyle={styles.handleIndicator}
        >
            <View className='flex flex-col relative h-full'>
                <View className='flex flex-col'>
                    <View className='w-full flex flex-row justify-center items-center pb-2.5'>
                        <Text
                            style={satoshiFont.satoshiBlack}
                            className='text-base text-center text-gray-900'
                        >
                            Filters
                        </Text>
                    </View>
                    <View className='w-full flex flex-col space-y-4 px-5'>
                        <View className='w-full flex flex-row justify-between items-center'>
                            <Text
                                style={satoshiFont.satoshiBold}
                                className='text-sm text-center text-gray-900'
                            >
                                Type
                            </Text>

                            <ChevronDownIcon
                                width={16}
                                height={16}
                                stroke='#9333EA'
                                strokeWidth={2}
                            />
                        </View>
                    </View>
                    <View className='w-full flex flex-col space-y-4 px-5'>
                        <View className='w-full flex flex-row justify-between items-center'>
                            <Text
                                style={satoshiFont.satoshiBold}
                                className='text-sm text-center text-gray-900'
                            >
                                Account
                            </Text>
                            <ChevronDownIcon
                                width={16}
                                height={16}
                                stroke='#9333EA'
                                strokeWidth={2}
                            />
                        </View>
                    </View>
                </View>
                <View className='flex flex-row space-x-2.5 justify-between w-full absolute bottom-5 px-5'>
                    <View className='flex-1'>
                        <TouchableOpacity
                            onPress={router.back}
                            style={{ width: '100%' }}
                            className='bg-purple-50 border border-purple-100 items-center justify-center rounded-full px-5 h-[50]'
                        >
                            <Text
                                style={satoshiFont.satoshiBlack}
                                className='text-purple-600 text-center'
                            >
                                Clear all
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className='flex-1'>
                        <TouchableOpacity
                            style={{ width: '100%' }}
                            // onPress={handleSubmit(onSubmit)}
                            // disabled={isLoading}
                        >
                            <LinearGradient
                                className='flex items-center justify-center rounded-full px-5 h-[50]'
                                colors={['#c084fc', '#9333ea']}
                                style={{ width: '100%' }}
                            >
                                <Text
                                    style={satoshiFont.satoshiBlack}
                                    className='text-white text-center'
                                >
                                    Apply
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
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
