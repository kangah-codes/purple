import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
    StyleProp,
} from 'react-native';

interface TooltipProps {
    visible: boolean;
    handleClose: () => void;
    handleOpen: () => void;
    trigger: React.ReactNode;
    children: React.ReactNode;
    direction?: 'top' | 'bottom' | 'left' | 'right';
    tooltipWidth?: number;
    tooltipHeight?: number;
    offset?: number;
    animationDuration?: number;
    style?: StyleProp<ViewStyle>;
    pad?: number;
}

interface Position {
    x: number;
    y: number;
    width: number;
    height: number;
}

export default function Tooltip({
    visible,
    handleOpen,
    handleClose,
    trigger,
    children,
    direction = 'bottom',
    tooltipWidth = 180,
    tooltipHeight = 60,
    offset = 8,
    animationDuration = 200,
    style,
    pad = 5,
}: TooltipProps) {
    const triggerRef = useRef<View>(null);
    const [position, setPosition] = useState<Position>({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    const [modalVisible, setModalVisible] = useState(false);

    // Animation values
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const translateAnim = useRef(new Animated.Value(0)).current;

    const measureTrigger = () => {
        if (triggerRef.current) {
            const screen = Dimensions.get('window');
            triggerRef.current.measure((fx, fy, width, height, px, py) => {
                let tooltipX = px + width / 2 - tooltipWidth / 2;
                let tooltipY = py + height + offset;

                if (direction === 'top') tooltipY = py - tooltipHeight - offset;
                if (direction === 'left') {
                    tooltipX = px - tooltipWidth - offset;
                    tooltipY = py + height / 2 - tooltipHeight / 2;
                }
                if (direction === 'right') {
                    tooltipX = px + width + offset;
                    tooltipY = py + height / 2 - tooltipHeight / 2;
                }

                // Prevent clipping horizontally
                if (tooltipX < pad) tooltipX = pad;
                if (tooltipX + tooltipWidth > screen.width - pad) {
                    tooltipX = screen.width - tooltipWidth - pad;
                }

                // Prevent clipping vertically
                if (tooltipY < pad) tooltipY = pad;
                if (tooltipY + tooltipHeight > screen.height - pad) {
                    tooltipY = screen.height - tooltipHeight - pad;
                }

                setPosition({
                    x: tooltipX,
                    y: tooltipY,
                    width,
                    height,
                });
            });
        }
    };

    const showTooltip = () => {
        measureTrigger();
        setModalVisible(true);

        // Reset animation values
        scaleAnim.setValue(0.8);
        opacityAnim.setValue(0);
        translateAnim.setValue(direction === 'top' ? -10 : 10);

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
            Animated.timing(translateAnim, {
                toValue: 0,
                duration: animationDuration,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const hideTooltip = () => {
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
            Animated.timing(translateAnim, {
                toValue: direction === 'top' ? -10 : 10,
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
            showTooltip();
        } else if (modalVisible) {
            hideTooltip();
        }
    }, [visible]);

    return (
        <View>
            <TouchableWithoutFeedback onPress={handleOpen}>
                <View ref={triggerRef}>{trigger}</View>
            </TouchableWithoutFeedback>

            {modalVisible && (
                <Modal
                    transparent
                    visible={modalVisible}
                    animationType='none'
                    hardwareAccelerated
                    onRequestClose={hideTooltip}
                >
                    <TouchableWithoutFeedback onPress={hideTooltip}>
                        <View style={styles.overlay}>
                            <TouchableWithoutFeedback>
                                <Animated.View
                                    style={[
                                        styles.tooltip,
                                        {
                                            top: position.y,
                                            left: position.x,
                                            width: tooltipWidth,
                                            height: tooltipHeight,
                                            opacity: opacityAnim,
                                            transform: [
                                                { scale: scaleAnim },
                                                direction === 'left' || direction === 'right'
                                                    ? { translateX: translateAnim }
                                                    : { translateY: translateAnim },
                                            ],
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
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    tooltip: {
        position: 'absolute',
        backgroundColor: '#333',
        padding: 8,
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
