import React, { useRef, useEffect, useState } from 'react';
import { View, Modal, StyleSheet, TouchableWithoutFeedback, Dimensions } from 'react-native';

interface DropdownMenuProps {
    visible: boolean;
    handleClose: () => void;
    handleOpen: () => void;
    trigger: React.ReactNode;
    children: React.ReactNode;
    dropdownWidth?: number;
    padX?: number;
    padY?: number;
}

interface Position {
    x: number;
    y: number;
    width: number;
}

export default function DropdownMenu({
    visible,
    handleOpen,
    handleClose,
    trigger,
    children,
    dropdownWidth = 150,
    padX = 5,
    padY = 5,
}: DropdownMenuProps) {
    const triggerRef = useRef<View>(null);
    const [position, setPosition] = useState<Position>({ x: 0, y: 0, width: 0 });

    useEffect(() => {
        if (triggerRef.current && visible) {
            const screenWidth = Dimensions.get('window').width;

            triggerRef.current.measure((fx, fy, width, height, px, py) => {
                // Calculate initial position (centered under trigger)
                let xPosition = px + width / 2 - dropdownWidth / 2;

                // Ensure dropdown stays 5px from right edge
                const rightEdgePosition = xPosition + dropdownWidth;
                if (rightEdgePosition > screenWidth - padX) {
                    xPosition = screenWidth - dropdownWidth - padX;
                }

                // Ensure dropdown stays 5px from left edge
                if (xPosition < padX) {
                    xPosition = padX;
                }

                setPosition({
                    x: xPosition,
                    y: py + padY, // Position 5px below trigger
                    width: width,
                });
            });
        }
    }, [visible, dropdownWidth]);

    return (
        <View>
            <TouchableWithoutFeedback onPress={handleOpen}>
                <View ref={triggerRef}>{trigger}</View>
            </TouchableWithoutFeedback>
            {visible && (
                <Modal
                    transparent={true}
                    visible={visible}
                    animationType='fade'
                    hardwareAccelerated
                    onRequestClose={handleClose}
                >
                    <TouchableWithoutFeedback onPress={handleClose}>
                        <View style={styles.modalOverlay}>
                            <View
                                style={[
                                    styles.menu,
                                    {
                                        top: position.y,
                                        left: position.x,
                                        width: dropdownWidth,
                                    },
                                ]}
                            >
                                {children}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        backgroundColor: 'transparent',
    },
    menu: {
        position: 'absolute',
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    menuOption: {
        padding: 5,
    },
});
