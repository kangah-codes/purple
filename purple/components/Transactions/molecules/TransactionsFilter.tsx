import AnimatedAccordion, { AccordionItem } from '@/components/Shared/molecules/AnimatedAccordion';
import CustomBottomSheetModal from '@/components/Shared/molecules/GlobalBottomSheetModal';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import React, { useEffect, useMemo, useCallback } from 'react';
import { Platform, StyleSheet } from 'react-native';
import tw from 'twrnc';
import TransactionTypeFilter from './TransactionsFilters/TransactionType';
import AccountsFilter from './TransactionsFilters/TransactionAccounts';
import TransactionCategoryFilter from './TransactionsFilters/TransactionCategory';
import TransactionAmountFilter from './TransactionsFilters/TransactionAmount';
import TransactionDateFilter from './TransactionsFilters/TransactionDate';
import { useTransactionStore } from '../hooks';
import { useQueryClient } from 'react-query';

const snapPoints = ['70%', '70%'];
const titleStyle = {
    text: {
        ...satoshiFont.satoshiBold,
    },
    container: {
        ...tw`bg-white border-b border-purple-100`,
    },
};

export default function TransactionsFilter() {
    const { bottomSheetModalKeys, setShowBottomSheetModal } = useBottomSheetModalStore();
    const { logEvent } = useAnalytics();
    const {
        resetTransactionsFilter,
        applyPendingFilters,
        transactionsFilter,
        setPendingTransactionsFilter,
    } = useTransactionStore();
    const queryClient = useQueryClient();

    const trackScreenView = useCallback(async () => {
        if (bottomSheetModalKeys['transactionsFilter']) {
            await logEvent('screen_view', {
                screen: 'transactions_filter_modal',
            });
        }
    }, [bottomSheetModalKeys, logEvent]);

    useEffect(() => {
        if (bottomSheetModalKeys['transactionsFilter']) {
            setPendingTransactionsFilter(transactionsFilter);
        }
    }, [bottomSheetModalKeys, transactionsFilter, setPendingTransactionsFilter]);

    const handleClearAll = useCallback(() => {
        resetTransactionsFilter();
        queryClient.invalidateQueries(['transactions']);
    }, [resetTransactionsFilter, queryClient]);

    const handleApply = useCallback(() => {
        applyPendingFilters();
        queryClient.invalidateQueries(['transactions']);
        setShowBottomSheetModal('transactionsFilter', false);
    }, [applyPendingFilters, queryClient, setShowBottomSheetModal]);

    const FooterButtonsWithHandlers = useCallback(
        () => (
            <View className='flex flex-row space-x-2.5 justify-between w-full px-5 py-5 mb-5'>
                <View className='flex-1'>
                    <TouchableOpacity
                        onPress={handleClearAll}
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
                    <TouchableOpacity onPress={handleApply} style={{ width: '100%' }}>
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
        ),
        [handleClearAll, handleApply],
    );

    useEffect(() => {
        trackScreenView();
    }, [trackScreenView]);

    const accordionItems: AccordionItem[] = useMemo(
        () => [
            {
                id: 'type',
                title: 'Type',
                content: <TransactionTypeFilter />,
            },
            {
                id: 'account',
                title: 'Account',
                content: <AccountsFilter />,
            },
            {
                id: 'category',
                title: 'Categories',
                content: <TransactionCategoryFilter />,
            },
            {
                id: 'amount',
                title: 'Amount',
                content: <TransactionAmountFilter />,
            },
            {
                id: 'date',
                title: 'Created date',
                content: <TransactionDateFilter />,
            },
        ],
        [],
    );

    return (
        <CustomBottomSheetModal
            modalKey={'transactionsFilter'}
            snapPoints={snapPoints}
            style={styles.customBottomSheetModal}
            handleIndicatorStyle={styles.handleIndicator}
            isScrollable
            footerComponent={FooterButtonsWithHandlers}
        >
            <View className='flex flex-col'>
                <View className='w-full flex flex-row justify-center items-center pb-2.5'>
                    <Text
                        style={satoshiFont.satoshiBlack}
                        className='text-base text-center text-gray-900'
                    >
                        Filters
                    </Text>
                </View>

                <AnimatedAccordion
                    items={accordionItems}
                    titleStyle={titleStyle}
                    chevronColor='#9333EA'
                    allowMultiple={false}
                    animationDuration={200}
                />
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
