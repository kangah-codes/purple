import { ArrowLeftIcon, EditSquareIcon, PlusIcon, TrashIcon } from '@/components/SVG/24x24';
import { DotsHorizontalIcon } from '@/components/SVG/noscale';
import DropdownMenu from '@/components/Shared/molecules/DropdownMenu';
import { MenuOption } from '@/components/Shared/molecules/DropdownMenu/MenuOption';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { usePlanStore } from '../hooks';

export default function PlanNavigationArea() {
    const { currentPlan } = usePlanStore();
    const [visible, setVisible] = useState(false);
    const { setShowBottomSheetModal } = useBottomSheetModalStore();

    if (!currentPlan) return null;

    return (
        <View className='w-full flex flex-row py-2.5 justify-between items-center px-5'>
            <TouchableOpacity
                onPress={router.back}
                className='bg-purple-300 px-4 py-2 flex items-center justify-center rounded-full'
            >
                <ArrowLeftIcon stroke='#9333EA' strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-lg'>
                {truncateStringIfLongerThan(currentPlan.name as string, 20)}
            </Text>

            <View className='flex flex-row space-x-2'>
                <TouchableOpacity onPress={() => router.push('/plans/transaction')}>
                    <View className='bg-purple-600 px-2 py-2 flex items-center justify-center rounded-full'>
                        <PlusIcon stroke={'#fff'} />
                    </View>
                </TouchableOpacity>
                <View className='bg-purple-600 px-2 py-2 flex items-center justify-center rounded-full'>
                    <DropdownMenu
                        visible={visible}
                        handleOpen={() => setVisible(true)}
                        handleClose={() => setVisible(false)}
                        trigger={
                            <DotsHorizontalIcon
                                stroke='#fff'
                                width='24'
                                height='24'
                                strokeWidth={2.5}
                            />
                        }
                        padX={20}
                        dropdownWidth={180}
                    >
                        <MenuOption
                            onSelect={() => {
                                setVisible(false);
                            }}
                        >
                            <View className='flex flex-row items-center space-x-1'>
                                <EditSquareIcon stroke='#A855F7' width={18} />
                                <Text style={GLOBAL_STYLESHEET.satoshiMedium} className='text-sm'>
                                    Edit Plan
                                </Text>
                            </View>
                        </MenuOption>
                        <MenuOption
                            onSelect={() => {
                                setShowBottomSheetModal('planScreenModal', true);
                            }}
                        >
                            <View className='flex flex-row items-center space-x-1'>
                                <TrashIcon stroke='#EF4444' width={18} />
                                <Text style={GLOBAL_STYLESHEET.satoshiMedium} className='text-sm'>
                                    Delete
                                </Text>
                            </View>
                        </MenuOption>
                    </DropdownMenu>
                </View>
            </View>
        </View>
    );
}
