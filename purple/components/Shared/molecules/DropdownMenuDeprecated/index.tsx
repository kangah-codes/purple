import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleProp,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from 'react-native';
interface DropdownMenuDeprecatedProps {
    visible: boolean;
    handleClose: () => void;
    handleOpen: () => void;
    trigger: React.ReactNode;
    children: React.ReactNode;
    dropdownWidth?: number;
    padX?: number;
    padY?: number;
    offsetY?: number;
    animationDuration?: number;
    style?: StyleProp<ViewStyle>;
}

interface Position {
    x: number;
    y: number;
    width: number;
}

/**
 * @deprecated
 */
export default function DropdownMenuDeprecated({
    visible,
    handleOpen,
    handleClose,
    trigger,
    children,
    dropdownWidth = 150,
    padX = 5,
    padY = 5,
    offsetY = 0,
    animationDuration = 200,
    style,
}: DropdownMenuDeprecatedProps) {
    const triggerRef = useRef<View>(null);
    const [position, setPosition] = useState<Position>({ x: 0, y: 0, width: 0 });
    const [modalVisible, setModalVisible] = useState(false);

    // Animation values
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(-10)).current;

    const measureTrigger = () => {
        if (triggerRef.current) {
            const screenWidth = Dimensions.get('window').width;

            triggerRef.current.measure((fx, fy, width, height, px, py) => {
                // Calculate initial position (centered under trigger)
                let xPosition = px + width / 2 - dropdownWidth / 2;

                // Ensure dropdown stays within screen bounds with padding
                const rightEdgePosition = xPosition + dropdownWidth;
                if (rightEdgePosition > screenWidth - padX) {
                    xPosition = screenWidth - dropdownWidth - padX;
                }

                if (xPosition < padX) {
                    xPosition = padX;
                }

                setPosition({
                    x: xPosition,
                    y: height + offsetY,
                    width: width,
                });
            });
        }
    };

    const showDropdown = () => {
        measureTrigger();
        setModalVisible(true);

        // Reset animation values
        scaleAnim.setValue(0.8);
        opacityAnim.setValue(0);
        translateYAnim.setValue(-10);

        // Start entrance animation
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: animationDuration * 0.8,
                useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
                toValue: 0,
                duration: animationDuration,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const hideDropdown = () => {
        // Start exit animation
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: animationDuration * 0.8,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: animationDuration * 0.8,
                useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
                toValue: -10,
                duration: animationDuration * 0.8,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setModalVisible(false);
            handleClose();
        });
    };

    useEffect(() => {
        if (visible) {
            showDropdown();
        } else if (modalVisible) {
            hideDropdown();
        }
    }, [visible]);

    return (
        <View>
            <TouchableWithoutFeedback onPress={handleOpen}>
                <View ref={triggerRef}>{trigger}</View>
            </TouchableWithoutFeedback>

            {modalVisible && (
                <Modal
                    transparent={true}
                    visible={modalVisible}
                    animationType='none'
                    hardwareAccelerated
                    onRequestClose={() => {
                        if (visible) {
                            hideDropdown();
                        }
                    }}
                >
                    <TouchableWithoutFeedback
                        onPress={() => {
                            if (visible) {
                                hideDropdown();
                            }
                        }}
                    >
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback onPress={() => {}}>
                                <Animated.View
                                    style={[
                                        styles.menu,
                                        {
                                            top: position.y + offsetY,
                                            left: position.x,
                                            width: dropdownWidth,
                                            transform: [
                                                { scale: scaleAnim },
                                                { translateY: translateYAnim },
                                            ],
                                            opacity: opacityAnim,
                                        },
                                        style,
                                    ]}
                                >
                                    {children}
                                </Animated.View>
                            </TouchableWithoutFeedback>
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
