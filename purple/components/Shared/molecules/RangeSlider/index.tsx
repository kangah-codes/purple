import React, { useState, useCallback, useMemo } from 'react';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    runOnJS,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { View, Text } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface RangeSliderProps {
    min: number;
    max: number;
    step?: number;
    initialMin?: number;
    initialMax?: number;
    onValueChange?: (min: number, max: number) => void;
    formatValue?: (value: number) => string;
    trackColor?: string;
    activeTrackColor?: string;
    thumbColor?: string;
    trackHeight?: number;
    thumbSize?: number;
    showLabels?: boolean;
    style?: any;
    thumbStyle?: StyleProp<ViewStyle>;
    hapticFeedback?: boolean;
}

export default function RangeSlider({
    min,
    max,
    step = 1,
    initialMin = min,
    initialMax = max,
    onValueChange,
    formatValue = (value) => value.toString(),
    trackColor = '#dab2ff',
    activeTrackColor = '#9333EA',
    thumbColor = '#ad46ff',
    trackHeight = 4,
    thumbSize = 24,
    showLabels = true,
    thumbStyle,
    style,
    hapticFeedback = true,
}: RangeSliderProps) {
    const [sliderWidth, setSliderWidth] = useState(280 - thumbSize);
    const THUMB_RADIUS = thumbSize / 2;
    const minValueShared = useSharedValue(initialMin);
    const maxValueShared = useSharedValue(initialMax);
    const [minDisplay, setMinDisplay] = useState(initialMin);
    const [maxDisplay, setMaxDisplay] = useState(initialMax);
    const minPosition = useSharedValue(((initialMin - min) / (max - min)) * sliderWidth);
    const maxPosition = useSharedValue(((initialMax - min) / (max - min)) * sliderWidth);

    const notifyValueChange = useCallback(
        (minVal: number, maxVal: number) => {
            onValueChange?.(minVal, maxVal);
        },
        [onValueChange],
    );

    const updateMinDisplay = useCallback((value: number) => {
        setMinDisplay(value);
    }, []);

    const updateMaxDisplay = useCallback((value: number) => {
        setMaxDisplay(value);
    }, []);

    const onSliderLayout = useCallback(
        (event: any) => {
            const { width } = event.nativeEvent.layout;
            if (width > 0) {
                const availableWidth = width - thumbSize;
                if (availableWidth !== sliderWidth) {
                    setSliderWidth(availableWidth);
                    minPosition.value =
                        ((minValueShared.value - min) / (max - min)) * availableWidth;
                    maxPosition.value =
                        ((maxValueShared.value - min) / (max - min)) * availableWidth;
                }
            }
        },
        [
            sliderWidth,
            thumbSize,
            min,
            max,
            minPosition,
            maxPosition,
            minValueShared,
            maxValueShared,
        ],
    );

    const triggerHaptic = useCallback(() => {
        if (hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    }, [hapticFeedback]);

    const minGestureHandler = useAnimatedGestureHandler<
        PanGestureHandlerGestureEvent,
        { startX: number; lastSnappedValue: number }
    >({
        onStart: (_, context) => {
            context.startX = minPosition.value;
            context.lastSnappedValue = minValueShared.value;
            runOnJS(triggerHaptic)();
        },
        onActive: (event, context) => {
            const newPosition = Math.max(
                0,
                Math.min(maxPosition.value - THUMB_RADIUS, context.startX + event.translationX),
            );
            minPosition.value = newPosition;

            const rawValue = interpolate(
                newPosition,
                [0, sliderWidth],
                [min, max],
                Extrapolate.CLAMP,
            );

            minValueShared.value = rawValue;

            const snappedValue = Math.round(rawValue / step) * step;
            if (snappedValue !== context.lastSnappedValue) {
                context.lastSnappedValue = snappedValue;
                const clampedValue = Math.min(snappedValue, maxValueShared.value - step);
                runOnJS(updateMinDisplay)(clampedValue);
            }
        },
        onEnd: () => {
            const snappedValue = Math.round(minValueShared.value / step) * step;
            const clampedValue = Math.min(snappedValue, maxValueShared.value - step);
            minValueShared.value = clampedValue;
            minPosition.value = ((clampedValue - min) / (max - min)) * sliderWidth;

            runOnJS(updateMinDisplay)(clampedValue);
            runOnJS(notifyValueChange)(clampedValue, maxValueShared.value);
        },
    });

    const maxGestureHandler = useAnimatedGestureHandler<
        PanGestureHandlerGestureEvent,
        { startX: number; lastSnappedValue: number }
    >({
        onStart: (_, context) => {
            context.startX = maxPosition.value;
            context.lastSnappedValue = maxValueShared.value;
            runOnJS(triggerHaptic)();
        },
        onActive: (event, context) => {
            const newPosition = Math.min(
                sliderWidth,
                Math.max(minPosition.value + THUMB_RADIUS, context.startX + event.translationX),
            );
            maxPosition.value = newPosition;

            const rawValue = interpolate(
                newPosition,
                [0, sliderWidth],
                [min, max],
                Extrapolate.CLAMP,
            );

            maxValueShared.value = rawValue;

            const snappedValue = Math.round(rawValue / step) * step;
            if (snappedValue !== context.lastSnappedValue) {
                context.lastSnappedValue = snappedValue;
                const clampedValue = Math.max(snappedValue, minValueShared.value + step);
                runOnJS(updateMaxDisplay)(clampedValue);
            }
        },
        onEnd: () => {
            const snappedValue = Math.round(maxValueShared.value / step) * step;
            const clampedValue = Math.max(snappedValue, minValueShared.value + step);
            maxValueShared.value = clampedValue;
            maxPosition.value = ((clampedValue - min) / (max - min)) * sliderWidth;

            runOnJS(updateMaxDisplay)(clampedValue);
            runOnJS(notifyValueChange)(minValueShared.value, clampedValue);
        },
    });

    const activeTrackStyle = useAnimatedStyle(() => ({
        left: minPosition.value,
        width: maxPosition.value - minPosition.value,
    }));

    const minThumbStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: minPosition.value - THUMB_RADIUS }],
    }));

    const maxThumbStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: maxPosition.value - THUMB_RADIUS }],
    }));

    const containerStyle = useMemo(
        () => ({
            height: thumbSize,
            justifyContent: 'center' as const,
            paddingHorizontal: THUMB_RADIUS,
        }),
        [thumbSize, THUMB_RADIUS],
    );

    const trackStyle = useMemo(
        () => ({
            height: trackHeight,
            width: '100%' as const,
            backgroundColor: trackColor,
            borderRadius: trackHeight / 2,
            position: 'relative' as const,
        }),
        [trackHeight, trackColor],
    );

    const activeTrackStaticStyle = useMemo(
        () => ({
            height: trackHeight,
            backgroundColor: activeTrackColor,
            borderRadius: trackHeight / 2,
            position: 'absolute' as const,
            top: 0,
        }),
        [trackHeight, activeTrackColor],
    );

    const thumbStaticStyle = useMemo(
        () => ({
            position: 'absolute' as const,
            top: -((thumbSize - trackHeight) / 2),
            width: thumbSize * 1.9,
            height: thumbSize,
            borderRadius: thumbSize / 2,
            backgroundColor: thumbColor,
        }),
        [thumbSize, trackHeight, thumbColor],
    );

    return (
        <View style={[style]}>
            {showLabels && (
                <View
                    style={{ flexDirection: 'row', justifyContent: 'space-between' }}
                    className='mb-2.5'
                >
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-black'>
                        {formatValue(minDisplay)}
                    </Text>
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-black'>
                        {formatValue(maxDisplay)}
                    </Text>
                </View>
            )}

            <View style={containerStyle}>
                <View onLayout={onSliderLayout} style={trackStyle}>
                    <Animated.View style={[activeTrackStaticStyle, activeTrackStyle]} />

                    <PanGestureHandler onGestureEvent={minGestureHandler}>
                        <Animated.View style={[thumbStaticStyle, minThumbStyle, thumbStyle]} />
                    </PanGestureHandler>

                    <PanGestureHandler onGestureEvent={maxGestureHandler}>
                        <Animated.View style={[thumbStaticStyle, maxThumbStyle, thumbStyle]} />
                    </PanGestureHandler>
                </View>
            </View>

            {showLabels && (
                <View
                    style={{ flexDirection: 'row', justifyContent: 'space-between' }}
                    className='mt-2.5'
                >
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-black'>
                        {formatValue(min)}
                    </Text>
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-black'>
                        {formatValue(max)}
                    </Text>
                </View>
            )}
        </View>
    );
}
