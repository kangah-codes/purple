// import React, { ReactNode } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import Animated, {
//     useSharedValue,
//     useAnimatedStyle,
//     withTiming,
//     Easing,
// } from 'react-native-reanimated';

// type TooltipProps = {
//     children: ReactNode;
//     message: string;
//     position?: 'top' | 'bottom' | 'left' | 'right';
//     backgroundColor?: string;
//     textColor?: string;
// };

// const Tooltip = ({
//     children,
//     message,
//     position = 'top',
//     backgroundColor = '#333',
//     textColor = '#fff',
// }: TooltipProps) => {
//     const opacity = useSharedValue(0);

//     const tooltipStyle = useAnimatedStyle(() => ({
//         opacity: opacity.value,
//         transform: [{ scale: opacity.value }],
//     }));

//     const positionStyles = {
//         top: { bottom: '100%', left: 0, marginBottom: 8 },
//         bottom: { top: '100%', left: 0, marginTop: 8 },
//         left: { right: '100%', top: 0, marginRight: 8 },
//         right: { left: '100%', top: 0, marginLeft: 8 },
//     };

//     const handlePressIn = () => {
//         opacity.value = withTiming(1, {
//             duration: 150,
//             easing: Easing.out(Easing.ease),
//         });
//     };

//     const handlePressOut = () => {
//         opacity.value = withTiming(0, {
//             duration: 150,
//             easing: Easing.out(Easing.ease),
//         });
//     };

//     return (
//         <View style={styles.container}>
//             <Animated.View
//                 style={[
//                     styles.tooltip,
//                     positionStyles[position],
//                     { backgroundColor },
//                     tooltipStyle,
//                 ]}
//             >
//                 <Text style={[styles.tooltipText, { color: textColor }]}>{message}</Text>
//             </Animated.View>

//             <View onTouchStart={handlePressIn} onTouchEnd={handlePressOut}>
//                 {children}
//             </View>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         position: 'relative',
//     },
//     tooltip: {
//         position: 'absolute',
//         padding: 8,
//         borderRadius: 4,
//         zIndex: 100,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.25,
//         shadowRadius: 4,
//         elevation: 5,
//     },
//     tooltipText: {
//         fontSize: 12,
//     },
// });

// export default Tooltip;

import React, { useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    Animated,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    LayoutChangeEvent,
    ViewStyle,
    TextStyle,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
    children: React.ReactNode;
    text: string;
    position?: TooltipPosition;
    backgroundColor?: string;
    textColor?: string;
    textStyle?: TextStyle;
    containerStyle?: ViewStyle;
    delay?: number;
    duration?: number;
    disabled?: boolean;
}

export default function Tooltip({
    children,
    text,
    position = 'top',
    backgroundColor = '#333',
    textColor = '#fff',
    textStyle,
    containerStyle,
    delay = 500,
    duration = 200,
    disabled = false,
}: TooltipProps) {
    const [visible, setVisible] = useState(false);
    const [tooltipLayout, setTooltipLayout] = useState({ width: 0, height: 0 });
    const [triggerLayout, setTriggerLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showTooltip = useCallback(() => {
        if (disabled) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setVisible(true);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, [disabled, duration, fadeAnim, scaleAnim]);

    const hideTooltip = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: duration / 2,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: duration / 2,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setVisible(false);
            });
        }, 1000); // Hide after 1 second
    }, [duration, fadeAnim, scaleAnim]);

    const onTriggerLayout = (event: LayoutChangeEvent) => {
        const { width, height, x, y } = event.nativeEvent.layout;
        setTriggerLayout({ width, height, x, y });
    };

    const onTooltipLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setTooltipLayout({ width, height });
    };

    const getTooltipStyle = (): ViewStyle => {
        const { width: tooltipWidth, height: tooltipHeight } = tooltipLayout;
        const { width: triggerWidth, height: triggerHeight } = triggerLayout;

        let top = 0;
        let left = 0;

        switch (position) {
            case 'top':
                top = -(tooltipHeight + 8);
                left = (triggerWidth - tooltipWidth) / 2;
                break;
            case 'bottom':
                top = triggerHeight + 8;
                left = (triggerWidth - tooltipWidth) / 2;
                break;
            case 'left':
                top = (triggerHeight - tooltipHeight) / 2;
                left = -(tooltipWidth + 8);
                break;
            case 'right':
                top = (triggerHeight - tooltipHeight) / 2;
                left = triggerWidth + 8;
                break;
        }

        // Prevent tooltip from going off-screen
        const maxLeft = screenWidth - tooltipWidth - 16;
        left = Math.max(16 - triggerLayout.x, Math.min(left, maxLeft - triggerLayout.x));

        return {
            position: 'absolute',
            top,
            left,
            zIndex: 1000,
        };
    };

    const getArrowStyle = (): ViewStyle => {
        const arrowSize = 6;
        const { width: tooltipWidth } = tooltipLayout;
        const { width: triggerWidth } = triggerLayout;

        let arrowStyle: ViewStyle = {
            position: 'absolute',
            width: 0,
            height: 0,
        };

        switch (position) {
            case 'top':
                arrowStyle = {
                    ...arrowStyle,
                    top: tooltipLayout.height,
                    left: tooltipWidth / 2 - arrowSize,
                    borderLeftWidth: arrowSize,
                    borderRightWidth: arrowSize,
                    borderTopWidth: arrowSize,
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                    borderTopColor: backgroundColor,
                };
                break;
            case 'bottom':
                arrowStyle = {
                    ...arrowStyle,
                    top: -arrowSize,
                    left: tooltipWidth / 2 - arrowSize,
                    borderLeftWidth: arrowSize,
                    borderRightWidth: arrowSize,
                    borderBottomWidth: arrowSize,
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                    borderBottomColor: backgroundColor,
                };
                break;
            case 'left':
                arrowStyle = {
                    ...arrowStyle,
                    top: tooltipLayout.height / 2 - arrowSize,
                    left: tooltipLayout.width,
                    borderTopWidth: arrowSize,
                    borderBottomWidth: arrowSize,
                    borderLeftWidth: arrowSize,
                    borderTopColor: 'transparent',
                    borderBottomColor: 'transparent',
                    borderLeftColor: backgroundColor,
                };
                break;
            case 'right':
                arrowStyle = {
                    ...arrowStyle,
                    top: tooltipLayout.height / 2 - arrowSize,
                    left: -arrowSize,
                    borderTopWidth: arrowSize,
                    borderBottomWidth: arrowSize,
                    borderRightWidth: arrowSize,
                    borderTopColor: 'transparent',
                    borderBottomColor: 'transparent',
                    borderRightColor: backgroundColor,
                };
                break;
        }

        return arrowStyle;
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <TouchableOpacity
                activeOpacity={1}
                onPressIn={showTooltip}
                onPressOut={hideTooltip}
                onLayout={onTriggerLayout}
                style={styles.trigger}
            >
                {children}
            </TouchableOpacity>

            {visible && (
                <Animated.View
                    style={[
                        styles.tooltip,
                        { backgroundColor },
                        getTooltipStyle(),
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                    onLayout={onTooltipLayout}
                >
                    <Text style={[styles.tooltipText, { color: textColor }, textStyle]}>
                        {text}
                    </Text>
                    <View style={getArrowStyle()} />
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    trigger: {
        // Add any default trigger styles here
    },
    tooltip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        maxWidth: 200,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    tooltipText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 18,
    },
});

// Usage examples:

// Basic usage
// <Tooltip text="This is a helpful tooltip">
//   <Text>Hover me</Text>
// </Tooltip>

// With custom styling
// <Tooltip
//   text="Custom styled tooltip"
//   position="bottom"
//   backgroundColor="#007AFF"
//   delay={300}
//   textStyle={{ fontSize: 12 }}
// >
//   <View style={{ padding: 10, backgroundColor: '#f0f0f0' }}>
//     <Text>Custom trigger</Text>
//   </View>
// </Tooltip>
