import { PlusIcon, TrashIcon } from '@/components/SVG/icons/24x24';
import {
    BarLineChartIcon,
    DotsHorizontalIcon,
    EyeCloseIcon,
    EyeOpenIcon,
} from '@/components/SVG/icons/noscale';
import DropdownMenu from '@/components/Shared/molecules/DropdownMenu';
import { MenuOption } from '@/components/Shared/molecules/DropdownMenu/MenuOption';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import tw from 'twrnc';
import { useAccountReportStore } from '../hooks';

export default function AccountsNavigationArea() {
    const { setShowChart, showChart } = useAccountReportStore();
    const [visible, setVisible] = useState(false);

    const handleNavigation = useCallback(() => {
        router.push('/accounts/new-acount');
    }, []);

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
                dropdownWidth={180}
                offsetY={10}
                style={[tw`rounded-3xl bg-white p-2 px-4`, styles.shadow]}
            >
                <MenuOption
                    onSelect={() => {
                        setVisible(false);
                        setShowChart(!showChart);
                    }}
                >
                    <View className='flex flex-row items-center space-x-2 py-1.5'>
                        <BarLineChartIcon stroke='#9333EA' width={18} height={18} strokeWidth={2} />
                        <Text style={satoshiFont.satoshiMedium} className='text-sm'>
                            {showChart ? 'Hide' : 'Show'} report
                        </Text>
                    </View>
                </MenuOption>
                <View className='h-[1px] border-b border-purple-200 my-0.5' />
                <MenuOption onSelect={alert}>
                    <View className='flex flex-row items-center space-x-1 py-1.5'>
                        <TrashIcon stroke='#EF4444' width={18} />
                        <Text style={satoshiFont.satoshiMedium} className='text-sm'>
                            Delete
                        </Text>
                    </View>
                </MenuOption>
            </DropdownMenu>

            <View className='absolute left-0 right-0 items-center'>
                <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                    Accounts
                </Text>
            </View>

            <LinearGradient
                className='rounded-full justify-center items-center'
                colors={['#c084fc', '#9333ea']}
            >
                <TouchableOpacity
                    className='px-4 py-2 flex items-center justify-center rounded-full'
                    onPress={handleNavigation}
                >
                    <PlusIcon stroke={'#fff'} width={24} height={24} />
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
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
