import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetModalProps,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';
import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useBottomSheetModalStore, useKeyboardSnapEffect } from './hooks';

interface CustomBottomSheetModalProps extends BottomSheetModalProps {
    children: React.ReactNode;
    modalKey: string;
    hideOnBackdropPress?: boolean;
}

const CustomBottomSheetModal = ({
    children,
    modalKey,
    hideOnBackdropPress = true,
    ...rest
}: CustomBottomSheetModalProps) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    // Memoize default snap points
    const defaultSnapPoints = useMemo(() => rest.snapPoints || ['50%', '70%'], [rest.snapPoints]);

    const { setShowBottomSheetModal, bottomSheetModalKeys, createBottomSheetModal } =
        useBottomSheetModalStore();

    // Combine the two useEffects for visibility handling
    useEffect(() => {
        const isVisible = bottomSheetModalKeys[modalKey];
        if (isVisible && bottomSheetRef.current) {
            bottomSheetRef.current.present();
        }
    }, [bottomSheetModalKeys[modalKey]]);

    // Memoize handlers
    const handleSheetChanges = useCallback(
        (index: number) => {
            if (index === -1) setShowBottomSheetModal(modalKey, false);
        },
        [modalKey, setShowBottomSheetModal],
    );

    const renderBackdrop = useCallback(
        (props: BottomSheetDefaultBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                onPress={() => {
                    console.log(hideOnBackdropPress);
                    if (hideOnBackdropPress) setShowBottomSheetModal(modalKey, false);
                }}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
            />
        ),
        [modalKey, setShowBottomSheetModal],
    );

    useKeyboardSnapEffect(bottomSheetRef);
    useEffect(() => {
        createBottomSheetModal(modalKey);
    }, [modalKey, createBottomSheetModal]);

    if (!bottomSheetModalKeys[modalKey]) return null;

    return (
        <BottomSheetModal
            backdropComponent={renderBackdrop}
            keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'interactive'}
            android_keyboardInputMode='adjustResize'
            keyboardBlurBehavior='restore'
            ref={bottomSheetRef}
            index={1}
            snapPoints={defaultSnapPoints}
            onChange={handleSheetChanges}
            {...rest}
            style={{ borderRadius: 28, overflow: 'hidden' }}
        >
            <BottomSheetView style={styles.bottomSheetView}>{children}</BottomSheetView>
        </BottomSheetModal>
    );
};

const styles = StyleSheet.create({
    bottomSheetView: {
        flex: 1,
        paddingBottom: 20,
    },
});

export default memo(CustomBottomSheetModal);
