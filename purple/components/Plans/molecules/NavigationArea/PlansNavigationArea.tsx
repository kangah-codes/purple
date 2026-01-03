import { CalendarIcon } from '@/components/SVG/icons/16x16';
import { PlusIcon } from '@/components/SVG/icons/24x24';
import { DotsHorizontalIcon } from '@/components/SVG/icons/noscale';
import DropdownMenu from '@/components/Shared/molecules/DropdownMenu';
import { MenuOption } from '@/components/Shared/molecules/DropdownMenu/MenuOption';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { useConfirmationModalStore } from '@/components/Shared/molecules/ConfirmationModal/state';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import tw from 'twrnc';
import { format } from 'date-fns';

export default function PlansNavigationArea({ selectedMonth }: { selectedMonth?: Date }) {
    const [visible, setVisible] = useState(false);
    const { showConfirmationModal } = useConfirmationModalStore();
    const monthLabel = format(selectedMonth ?? new Date(), 'MMMM yyyy');

    return (
        <View className='w-full flex flex-row py-2.5 justify-between items-center relative px-5'>
            <DropdownMenu
                visible={visible}
                handleOpen={() => setVisible(true)}
                handleClose={() => setVisible(false)}
                trigger={
                    <View className='bg-purple-50 px-4 py-2 flex items-center justify-center rounded-full'>
                        <DotsHorizontalIcon
                            stroke='#9333EA'
                            strokeWidth={2.5}
                            width={24}
                            height={24}
                        />
                    </View>
                }
                padX={20}
                dropdownWidth={210}
                offsetY={10}
                style={[tw`rounded-full bg-white p-2 px-4`, styles.shadow]}
            >
                <MenuOption
                    onSelect={() => {
                        setVisible(false);
                        router.push('/settings/transactions/recurring-transactions');
                    }}
                >
                    <View className='flex flex-row items-center space-x-2 py-1.5'>
                        <CalendarIcon stroke='#9333EA' width={18} height={18} strokeWidth={1.5} />
                        <Text style={satoshiFont.satoshiMedium} className='text-sm'>
                            Recurring transactions
                        </Text>
                    </View>
                </MenuOption>
            </DropdownMenu>

            <View className='absolute left-0 right-0 items-center'>
                <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                    {monthLabel}
                </Text>
            </View>

            <LinearGradient
                className='rounded-full justify-center items-center'
                colors={['#c084fc', '#9333ea']}
            >
                <TouchableOpacity
                    className='px-4 py-2 flex items-center justify-center rounded-full'
                    onPress={() => {
                        showConfirmationModal({
                            title: 'Create a new budget?',
                            message: `Adding a new budget for ${monthLabel} will override the current month's budget. You will not be able to access the previous budget after creating a new one.`,
                            confirmText: 'Continue',
                            onConfirm: () => router.push('/plans/new'),
                        });
                    }}
                >
                    <PlusIcon stroke={'#fff'} width={24} height={24} />
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 100,
        paddingHorizontal: 20,
    },
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
    shadow: {
        shadowColor: '#3c0366',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
});
