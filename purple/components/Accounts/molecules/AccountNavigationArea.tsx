import { ArrowLeftIcon, EditSquareIcon, PlusIcon, TrashIcon } from '@/components/SVG/icons/24x24';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useAccountStore, useDeleteAccount } from '../hooks';
import { DotsHorizontalIcon } from '@/components/SVG/icons/noscale';
import DropdownMenu from '@/components/Shared/molecules/DropdownMenu';
import { StyleSheet } from 'react-native';
import tw from 'twrnc';
import Toast from 'react-native-toast-message';
import { useQueryClient } from 'react-query';
import HTTPError from '@/lib/utils/error';
import { useConfirmationModalStore } from '@/components/Shared/molecules/ConfirmationModal/state';

export default function AccountNavigationArea() {
    const { currentAccount } = useAccountStore();
    const [visible, setVisible] = useState(false);
    const queryClient = useQueryClient();
    const { mutate } = useDeleteAccount({ id: currentAccount?.id ?? '' });
    const { showConfirmationModal } = useConfirmationModalStore();

    const handleDeleteAccount = () => {
        setVisible(false);
        showConfirmationModal({
            title: 'Delete Account?',
            message:
                'All transactions linked to this account will also be deleted. This action cannot be undone.',
            confirmText: 'Delete',
            onConfirm: () => {
                mutate(undefined, {
                    onError: (err) => {
                        if (err instanceof HTTPError) {
                            Toast.show({
                                type: 'error',
                                props: {
                                    text1: 'Error!',
                                    text2: err.message,
                                },
                            });
                            return;
                        }
                        Toast.show({
                            type: 'error',
                            props: {
                                text1: 'Error!',
                                text2: 'There was an issue deleting account',
                            },
                        });
                    },
                    onSuccess: () => {
                        queryClient.invalidateQueries({
                            queryKey: ['transactions', 'accounts'],
                        });
                        Toast.show({
                            type: 'success',
                            props: {
                                text1: 'Success!',
                                text2: 'Account deleted successfully',
                            },
                        });
                        router.back();
                    },
                });
            },
            onCancel: () => {
                // Optional cancel callback
            },
        });
    };

    if (!currentAccount) return null;

    return (
        <View className='w-full flex flex-row py-2.5 justify-between items-center relative px-5'>
            <TouchableOpacity
                onPress={router.back}
                className='bg-purple-100 px-4 py-2 flex items-center justify-center rounded-full'
            >
                <ArrowLeftIcon stroke='#9333EA' strokeWidth={2.5} />
            </TouchableOpacity>

            <View className='absolute left-0 right-0 items-center'>
                <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                    {truncateStringIfLongerThan(currentAccount.name as string, 10)}
                </Text>
            </View>

            <View className='flex flex-row space-x-2.5'>
                <DropdownMenu
                    visible={visible}
                    handleOpen={() => setVisible(true)}
                    handleClose={() => setVisible(false)}
                    trigger={
                        <View className='bg-purple-50 p-2 flex items-center justify-center rounded-full'>
                            <DotsHorizontalIcon
                                stroke='#9333EA'
                                strokeWidth={2.5}
                                width={24}
                                height={24}
                            />
                        </View>
                    }
                    dropdownWidth={150}
                    offsetY={10}
                    style={[tw`rounded-3xl bg-white p-2 px-4`, styles.shadow]}
                >
                    <TouchableOpacity
                        delayLongPress={500}
                        onPress={() => {
                            setVisible(false);
                            router.push('/accounts/edit-account');
                        }}
                    >
                        <View className='flex flex-row items-center space-x-2 py-1.5'>
                            <EditSquareIcon stroke='#ad46ff' width={18} />
                            <Text style={satoshiFont.satoshiMedium} className='text-sm'>
                                Edit
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <View className='h-[1px] border-b border-purple-200 my-0.5' />
                    <TouchableOpacity delayLongPress={500} onPress={handleDeleteAccount}>
                        <View className='flex flex-row items-center space-x-2 py-1.5'>
                            <TrashIcon stroke='#EF4444' width={18} />
                            <Text style={satoshiFont.satoshiMedium} className='text-sm'>
                                Delete
                            </Text>
                        </View>
                    </TouchableOpacity>
                </DropdownMenu>
                <LinearGradient
                    className='rounded-full justify-center items-center'
                    colors={['#c084fc', '#9333ea']}
                >
                    <TouchableOpacity
                        className='px-4 py-2 flex items-center justify-center rounded-full'
                        onPress={() => {
                            router.push({
                                pathname: '/transactions/new',
                                params: {
                                    accountId: currentAccount.id,
                                },
                            });
                        }}
                    >
                        <PlusIcon stroke={'#fff'} width={24} height={24} />
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
