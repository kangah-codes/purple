import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

type SwitchProps = {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
    style?: ViewStyle;
    duration?: number;
    trackColors?: { on: string; off: string };
};

const THUMB_WIDTH = 35;
const TRACK_PADDING = 3;

export default function Switch({
    value,
    onValueChange,
    disabled = false,
    style,
    duration = 200,
    trackColors = { on: '#9810fa', off: '#dab2ff' },
}: SwitchProps) {
    const height = useSharedValue(0);
    const width = useSharedValue(0);

    const trackAnimatedStyle = useAnimatedStyle(() => {
        const color = interpolateColor(value ? 1 : 0, [0, 1], [trackColors.off, trackColors.on]);
        return {
            backgroundColor: withTiming(color, { duration }),
            borderRadius: height.value,
        };
    });

    const thumbAnimatedStyle = useAnimatedStyle(() => {
        const moveValue = interpolate(
            value ? 1 : 0,
            [0, 1],
            [0, width.value - THUMB_WIDTH - TRACK_PADDING * 2],
        );

        return {
            transform: [{ translateX: withTiming(moveValue, { duration }) }],
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

const styles = StyleSheet.create({
    track: {
        alignItems: 'flex-start',
        width: THUMB_WIDTH * 1.9,
        height: 30,
        padding: TRACK_PADDING,
    },
    thumb: {
        height: '100%',
        width: THUMB_WIDTH,
        backgroundColor: 'white',
    },
});
