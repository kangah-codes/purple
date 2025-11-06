import CustomBottomSheetModal from '@/components/Shared/molecules/GlobalBottomSheetModal';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import { LinearGradient, View, TouchableOpacity, Text } from '@/components/Shared/styled';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { satoshiFont } from '@/lib/constants/fonts';
import AnimatedAccordion, { AccordionItem } from '@/components/Shared/molecules/AnimatedAccordion';
import SelectablePill from '@/components/Shared/molecules/SelectablePill';
import tw from 'twrnc';
const snapPoints = ['55%', '70%'];

export default function TransactionsFilter() {
    const { bottomSheetModalKeys } = useBottomSheetModalStore();
    const { logEvent } = useAnalytics();
    const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
    const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());

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

    const handleTypeSelect = (id: string) => {
        setSelectedTypes((prev) => new Set([...prev, id]));
    };

    const handleTypeDeselect = (id: string) => {
        setSelectedTypes((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
    };

    const handleAccountSelect = (id: string) => {
        setSelectedAccounts((prev) => new Set([...prev, id]));
    };

    const handleAccountDeselect = (id: string) => {
        setSelectedAccounts((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
    };
    console.log('Selected Types:', selectedTypes);
    const accordionItems: AccordionItem[] = [
        {
            id: 'type',
            title: 'Type',
            content: (
                <View className='p-5 bg-purple-50'>
                    <View className='flex flex-row space-x-2'>
                        <View>
                            <SelectablePill
                                id='income'
                                label='Income'
                                isSelected={selectedTypes.has('income')}
                                onSelect={handleTypeSelect}
                                onDeselect={handleTypeDeselect}
                                textStyle={satoshiFont.satoshiMedium}
                                selectedTextStyle={satoshiFont.satoshiBold}
                            />
                        </View>
                        <View>
                            <SelectablePill
                                id='expense'
                                label='Expense'
                                isSelected={selectedTypes.has('expense')}
                                onSelect={handleTypeSelect}
                                onDeselect={handleTypeDeselect}
                                textStyle={satoshiFont.satoshiMedium}
                                selectedTextStyle={satoshiFont.satoshiBold}
                            />
                        </View>
                    </View>
                </View>
            ),
        },
        {
            id: 'account',
            title: 'Account',
            content: (
                <View className='px-5 pb-4'>
                    <View className='flex flex-row flex-wrap'>
                        <SelectablePill
                            id='checking'
                            label='Checking Account'
                            isSelected={selectedAccounts.has('checking')}
                            onSelect={handleAccountSelect}
                            onDeselect={handleAccountDeselect}
                            textStyle={satoshiFont.satoshiMedium}
                            selectedTextStyle={satoshiFont.satoshiBold}
                        />
                        <SelectablePill
                            id='savings'
                            label='Savings Account'
                            isSelected={selectedAccounts.has('savings')}
                            onSelect={handleAccountSelect}
                            onDeselect={handleAccountDeselect}
                            textStyle={satoshiFont.satoshiMedium}
                            selectedTextStyle={satoshiFont.satoshiBold}
                        />
                        <SelectablePill
                            id='credit'
                            label='Credit Card'
                            isSelected={selectedAccounts.has('credit')}
                            onSelect={handleAccountSelect}
                            onDeselect={handleAccountDeselect}
                            textStyle={satoshiFont.satoshiMedium}
                            selectedTextStyle={satoshiFont.satoshiBold}
                        />
                    </View>
                </View>
            ),
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
