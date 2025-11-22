import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import React, { useEffect } from 'react';
import CustomBottomSheetModal from '../GlobalBottomSheetModal';
import { satoshiFont } from '@/lib/constants/fonts';
import { useConfirmationModalStore } from './state';
import { useBottomSheetModalStore } from '../GlobalBottomSheetModal/hooks';

const snapPoints = ['30%', '30%'];
const modalKey = 'globalConfirmationModal';

export default function ConfirmationModal() {
    const { isVisible, title, message, confirmText, onConfirm, onCancel, hideConfirmationModal } =
        useConfirmationModalStore();

    const { setShowBottomSheetModal } = useBottomSheetModalStore();

    useEffect(() => {
        setShowBottomSheetModal(modalKey, isVisible);
    }, [isVisible, setShowBottomSheetModal]);

    const handleCancel = () => {
        hideConfirmationModal();
        onCancel?.();
    };

    const handleConfirm = () => {
        hideConfirmationModal();
        onConfirm?.();
    };

    const handleDismiss = () => {
        hideConfirmationModal();
        onCancel?.();
    };

    return (
        <CustomBottomSheetModal
            modalKey={modalKey}
            snapPoints={snapPoints}
            hideOnBackdropPress={true}
            onDismiss={handleDismiss}
            style={{
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
            }}
            handleIndicatorStyle={{
                backgroundColor: '#D4D4D4',
            }}
        >
            <View className='flex flex-col p-5 space-y-7 relative h-full'>
                <View className='flex flex-col space-y-2.5'>
                    <Text
                        style={satoshiFont.satoshiBlack}
                        className='text-2xl text-black text-center'
                    >
                        {title}
                    </Text>
                    <Text
                        style={satoshiFont.satoshiBold}
                        className='text-sm text-purple-500 text-center'
                    >
                        {message}
                    </Text>
                </View>
                <View className='items-center self-center justify-center absolute bottom-5 w-full'>
                    <View className='flex flex-row space-x-2.5 justify-between w-full'>
                        <View className='flex-1'>
                            <TouchableOpacity
                                onPress={handleCancel}
                                style={{ width: '100%' }}
                                className='bg-purple-50 border border-purple-100 items-center justify-center rounded-full px-5 h-[50]'
                            >
                                <Text
                                    style={satoshiFont.satoshiBlack}
                                    className='text-purple-600 text-center'
                                >
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View className='flex-1'>
                            <TouchableOpacity style={{ width: '100%' }} onPress={handleConfirm}>
                                <LinearGradient
                                    className='flex items-center justify-center rounded-full px-5 h-[50]'
                                    colors={['#c084fc', '#9333ea']}
                                    style={{ width: '100%' }}
                                >
                                    <Text
                                        style={satoshiFont.satoshiBlack}
                                        className='text-white text-center'
                                    >
                                        {confirmText}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </CustomBottomSheetModal>
    );
}
