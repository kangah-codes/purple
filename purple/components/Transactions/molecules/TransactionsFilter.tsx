import AnimatedAccordion, { AccordionItem } from '@/components/Shared/molecules/AnimatedAccordion';
import CustomBottomSheetModal from '@/components/Shared/molecules/GlobalBottomSheetModal';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import React, { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import tw from 'twrnc';
import TransactionTypeFilter from './TransactionsFilters/TransactionType';
import AccountsFilter from './TransactionsFilters/Accounts';
import TransactionCategoryFilter from './TransactionsFilters/TransactionCategory';
const snapPoints = ['55%', '70%'];

export default function TransactionsFilter() {
    const { bottomSheetModalKeys } = useBottomSheetModalStore();
    const { logEvent } = useAnalytics();

    useEffect(() => {
        const trackScreenView = async () => {
            if (bottomSheetModalKeys['transactionsFilter']) {
                await logEvent('screen_view', {
                    screen: 'transactions_filter_modal',
                });
            }
        };

        trackScreenView();
    }, [bottomSheetModalKeys, logEvent]);

    const accordionItems: AccordionItem[] = [
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
    ];

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

                    <AnimatedAccordion
                        items={accordionItems}
                        titleStyle={{
                            text: {
                                ...satoshiFont.satoshiBold,
                            },
                            container: {
                                ...tw`bg-white border-b border-purple-100`,
                            },
                        }}
                        chevronColor='#9333EA'
                        allowMultiple={false}
                        animationDuration={250}
                    />
                </View>
                <View className='flex flex-row space-x-2.5 justify-between w-full absolute bottom-5 px-5'>
                    <View className='flex-1'>
                        <TouchableOpacity
                            onPress={() => {}}
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
