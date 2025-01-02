import { useStore } from 'zustand';
import { createBottomSheetModalStore } from './state';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useEffect } from 'react';
import { Platform, Keyboard } from 'react-native';

/**
 * Custom hook for managing the state of a bottom sheet modal.
 * @returns An object containing the state and functions for managing the bottom sheet modal.
 */
export function useBottomSheetModalStore(): {
    showBottomSheetModal: boolean;
    setShowBottomSheetModal: (key: string, show: boolean) => void;
    createBottomSheetModal: (key: string) => void;
    bottomSheetModalKeys: Record<string, boolean>;
} {
    const [
        showBottomSheetModal,
        setShowBottomSheetModal,
        createBottomSheetModal,
        bottomSheetModalKeys,
    ] = useStore(createBottomSheetModalStore, (state) => [
        state.showBottomSheetModal,
        state.toggleShowBottomSheetModal,
        state.createBottomSheetModal,
        state.bottomSheetModalKeys,
    ]);

    return {
        showBottomSheetModal,
        setShowBottomSheetModal,
        createBottomSheetModal,
        bottomSheetModalKeys,
    };
}

export function useKeyboardSnapEffect(bottomSheetRef: React.RefObject<BottomSheetModal>) {
    useEffect(() => {
        if (Platform.OS === 'android') {
            const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
                bottomSheetRef.current?.snapToIndex(1);
            });
            return () => showSubscription.remove();
        }
    }, []);
}
