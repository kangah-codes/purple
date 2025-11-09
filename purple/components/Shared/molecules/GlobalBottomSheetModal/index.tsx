import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetModalProps,
    BottomSheetScrollView,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useBottomSheetModalStore, useKeyboardSnapEffect } from './hooks';
import { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';

interface CustomBottomSheetModalProps extends BottomSheetModalProps {
    children: React.ReactNode;
    modalKey: string;
    hideOnBackdropPress?: boolean;
    isScrollable?: boolean;
}

const CustomBottomSheetModal = ({
    children,
    modalKey,
    isScrollable = false,
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
                    if (hideOnBackdropPress) setShowBottomSheetModal(modalKey, false);
                }}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
            />
        ),
        [modalKey, setShowBottomSheetModal, hideOnBackdropPress],
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
            {isScrollable ? (
                <View style={styles.scrollableContainer}>
                    <BottomSheetScrollView
                        contentContainerStyle={styles.scrollableContent}
                        style={styles.scrollView}
                    >
                        {children}
                    </BottomSheetScrollView>
                </View>
            ) : (
                <BottomSheetView style={styles.bottomSheetView}>{children}</BottomSheetView>
            )}
        </BottomSheetModal>
    );
};

const styles = StyleSheet.create({
    bottomSheetView: {
        flex: 1,
        paddingBottom: 20,
    },
    scrollableContainer: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollableContent: {
        paddingBottom: 20,
    },
});

export default memo(CustomBottomSheetModal);
