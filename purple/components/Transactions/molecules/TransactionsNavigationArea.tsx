import { CalendarIcon } from '@/components/SVG/icons/16x16';
import { PlusIcon } from '@/components/SVG/icons/24x24';
import {
    DotsHorizontalIcon,
    FilterLinesIcon,
    SearchIcon,
    XIcon,
} from '@/components/SVG/icons/noscale';
import DropdownMenu from '@/components/Shared/molecules/DropdownMenu';
import { MenuOption } from '@/components/Shared/molecules/DropdownMenu/MenuOption';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import {
    InputField,
    LinearGradient,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import tw from 'twrnc';

type TransactionsNavigationAreaProps = {
    onSearchFocus?: () => void;
    onSearchChange?: (searchValue: string) => void;
    searchValue?: string;
};

export default function TransactionsNavigationArea({
    onSearchFocus,
    onSearchChange,
    searchValue: externalSearchValue,
}: TransactionsNavigationAreaProps) {
    const [visible, setVisible] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const { setShowBottomSheetModal } = useBottomSheetModalStore();

    const displaySearchValue =
        externalSearchValue !== undefined ? externalSearchValue : searchValue;

    return (
        <View className='w-full flex flex-col px-5 py-2.5'>
            <View className='w-full flex flex-row justify-between items-center relative '>
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
                            <CalendarIcon
                                stroke='#9333EA'
                                width={18}
                                height={18}
                                strokeWidth={1.5}
                            />
                            <Text style={satoshiFont.satoshiMedium} className='text-sm'>
                                Recurring transactions
                            </Text>
                        </View>
                    </MenuOption>
                </DropdownMenu>

                <View className='absolute left-0 right-0 items-center'>
                    <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                        Transactions
                    </Text>
                </View>

                <LinearGradient
                    className='rounded-full justify-center items-center'
                    colors={['#c084fc', '#9333ea']}
                >
                    <TouchableOpacity
                        className='px-4 py-2 flex items-center justify-center rounded-full'
                        onPress={() => router.push('/transactions/new')}
                    >
                        <PlusIcon stroke={'#fff'} width={24} height={24} />
                    </TouchableOpacity>
                </LinearGradient>
            </View>
            <View className='flex flex-row space-x-2.5 mt-2.5'>
                <View className='bg-purple-50 h-12 border border-white rounded-full px-4 flex flex-row items-center w-full'>
                    <View className='flex-1 flex-row items-center'>
                        <SearchIcon
                            width={16}
                            height={16}
                            style={{
                                position: 'absolute',
                                left: 0,
                            }}
                            stroke='#9333EA'
                        />
                        <InputField
                            className='border border-purple-50 text-xs text-gray-900 pl-5 flex-1'
                            style={satoshiFont.satoshiBold}
                            placeholder='Search'
                            cursorColor={'#000'}
                            onFocus={onSearchFocus}
                            onChangeText={(text) => {
                                if (externalSearchValue === undefined) {
                                    setSearchValue(text);
                                }
                                onSearchChange?.(text);
                            }}
                            value={displaySearchValue}
                            animateBorder={false}
                        />
                        {displaySearchValue.length > 0 && (
                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                }}
                                onPress={() => {
                                    setSearchValue('');
                                    onSearchChange?.('');
                                }}
                            >
                                <XIcon width={16} height={16} stroke='#c27aff' strokeWidth={3} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        className='ml-3'
                        onPress={() => {
                            setShowBottomSheetModal('transactionsFilter', true);
                            Keyboard.dismiss();
                        }}
                    >
                        <FilterLinesIcon width={20} height={20} stroke='#9333EA' strokeWidth={2} />
                    </TouchableOpacity>
                </View>
            </View>
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
