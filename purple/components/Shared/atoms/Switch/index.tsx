import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

type SwitchProps = {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
    style?: ViewStyle;
    scale?: number;
    widthRatio?: number;
    springConfig?: {
        damping?: number;
        stiffness?: number;
        mass?: number;
    };
    trackColors?: { on: string; off: string };
};

const THUMB_WIDTH = 30;
const TRACK_PADDING = 3;

export default function Switch({
    value,
    onValueChange,
    disabled = false,
    style,
    scale = 1,
    widthRatio = 1.9,
    springConfig = {
        damping: 15,
        stiffness: 150,
        mass: 1,
    },
    trackColors = { on: '#9810fa', off: '#dab2ff' },
}: SwitchProps) {
    const height = useSharedValue(0);
    const width = useSharedValue(0);

    const styles = StyleSheet.create({
        track: {
            alignItems: 'flex-start',
            width: THUMB_WIDTH * widthRatio * scale,
            height: 25 * scale,
            padding: TRACK_PADDING * scale,
        },
        thumb: {
            height: '100%',
            width: THUMB_WIDTH * scale,
            backgroundColor: 'white',
        },
    });

    const trackAnimatedStyle = useAnimatedStyle(() => {
        const color = interpolateColor(value ? 1 : 0, [0, 1], [trackColors.off, trackColors.on]);
        return {
            backgroundColor: withSpring(color, springConfig),
            borderRadius: height.value,
        };
    });

    const thumbAnimatedStyle = useAnimatedStyle(() => {
        const moveValue = interpolate(
            value ? 1 : 0,
            [0, 1],
            [0, width.value - THUMB_WIDTH * scale - TRACK_PADDING * 2 * scale],
        );
        return {
            transform: [{ translateX: withSpring(moveValue, springConfig) }],
            borderRadius: height.value,
        };
    });

    const handlePress = () => {
        if (!disabled) {
            onValueChange(!value);
        }
    };

    return (
        <Pressable onPress={handlePress} disabled={disabled}>
            <Animated.View
                onLayout={(e) => {
                    height.value = e.nativeEvent.layout.height;
                    width.value = e.nativeEvent.layout.width;
                }}
                style={[styles.track, style, trackAnimatedStyle]}
            >
                <Animated.View style={[styles.thumb, thumbAnimatedStyle]} />
            </Animated.View>
        </Pressable>
    );
}
