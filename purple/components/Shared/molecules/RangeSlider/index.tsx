import React, { useState } from 'react';
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
    trackColor = '#E5E7EB',
    activeTrackColor = '#9333EA',
    thumbColor = '#ad46ff',
    trackHeight = 4,
    thumbSize = 24,
    showLabels = true,
    thumbStyle,
    style,
    hapticFeedback = true,
}: RangeSliderProps) {
    const [sliderWidth, setSliderWidth] = useState(280 - thumbSize); // Default fallback width minus thumb size
    const THUMB_RADIUS = thumbSize / 2;

    const [minValue, setMinValue] = useState(initialMin);
    const [maxValue, setMaxValue] = useState(initialMax);

    const minPosition = useSharedValue(((initialMin - min) / (max - min)) * sliderWidth);
    const maxPosition = useSharedValue(((initialMax - min) / (max - min)) * sliderWidth);

    const snapToStep = (value: number) => {
        const snappedValue = Math.round(value / step) * step;
        return Math.max(min, Math.min(max, snappedValue));
    };

    const updateMinValue = (value: number) => {
        const snappedValue = snapToStep(value);
        const clampedValue = Math.min(snappedValue, maxValue - step);
        setMinValue(clampedValue);
        onValueChange?.(clampedValue, maxValue);
    };

    const updateMaxValue = (value: number) => {
        const snappedValue = snapToStep(value);
        const clampedValue = Math.max(snappedValue, minValue + step);
        setMaxValue(clampedValue);
        onValueChange?.(minValue, clampedValue);
    };

    const onSliderLayout = (event: any) => {
        const { width } = event.nativeEvent.layout;
        if (width > 0) {
            // Subtract thumb size to prevent overflow
            const availableWidth = width - thumbSize;
            if (availableWidth !== sliderWidth) {
                setSliderWidth(availableWidth);
                // Update positions based on new available width
                minPosition.value = ((minValue - min) / (max - min)) * availableWidth;
                maxPosition.value = ((maxValue - min) / (max - min)) * availableWidth;
            }
        }
    };

    const triggerHapticFeedback = () => {
        if (hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const minGestureHandler = useAnimatedGestureHandler<
        PanGestureHandlerGestureEvent,
        { startX: number }
    >({
        onStart: (_, context) => {
            context.startX = minPosition.value;
            runOnJS(triggerHapticFeedback)();
        },
        onActive: (event, context) => {
            const newPosition = Math.max(
                0,
                Math.min(maxPosition.value - THUMB_RADIUS, context.startX + event.translationX),
            );
            minPosition.value = newPosition;

            const newValue = interpolate(
                newPosition,
                [0, sliderWidth],
                [min, max],
                Extrapolate.CLAMP,
            );
            runOnJS(updateMinValue)(newValue);
        },
    });

    const maxGestureHandler = useAnimatedGestureHandler<
        PanGestureHandlerGestureEvent,
        { startX: number }
    >({
        onStart: (_, context) => {
            context.startX = maxPosition.value;
            runOnJS(triggerHapticFeedback)();
        },
        onActive: (event, context) => {
            const newPosition = Math.min(
                sliderWidth,
                Math.max(minPosition.value + THUMB_RADIUS, context.startX + event.translationX),
            );
            maxPosition.value = newPosition;

            const newValue = interpolate(
                newPosition,
                [0, sliderWidth],
                [min, max],
                Extrapolate.CLAMP,
            );
            runOnJS(updateMaxValue)(newValue);
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

    return (
        <View style={[style]}>
            {showLabels && (
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}
                    className='mb-2.5'
                >
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-black'>
                        {formatValue(minValue)}
                    </Text>
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-black'>
                        {formatValue(maxValue)}
                    </Text>
                </View>
            )}

            <View
                style={{
                    height: thumbSize,
                    justifyContent: 'center',
                    paddingHorizontal: THUMB_RADIUS,
                }}
            >
                <View
                    onLayout={onSliderLayout}
                    style={{
                        height: trackHeight,
                        width: '100%',
                        backgroundColor: trackColor,
                        borderRadius: trackHeight / 2,
                        position: 'relative',
                    }}
                >
                    {/* Active track */}
                    <Animated.View
                        style={[
                            activeTrackStyle,
                            {
                                height: trackHeight,
                                backgroundColor: activeTrackColor,
                                borderRadius: trackHeight / 2,
                                position: 'absolute',
                                top: 0,
                            },
                        ]}
                    />

                    {/* Min thumb */}
                    <PanGestureHandler onGestureEvent={minGestureHandler}>
                        <Animated.View
                            style={[
                                minThumbStyle,
                                {
                                    position: 'absolute',
                                    top: -((thumbSize - trackHeight) / 2),
                                    width: thumbSize * 1.9,
                                    height: thumbSize,
                                    borderRadius: thumbSize / 2,
                                    backgroundColor: thumbColor,
                                    // shadowColor: '#000',
                                    // shadowOffset: { width: 0, height: 2 },
                                    // shadowOpacity: 0.25,
                                    // shadowRadius: 4,
                                    // elevation: 5,
                                },
                                thumbStyle,
                            ]}
                        />
                    </PanGestureHandler>

                    {/* Max thumb */}
                    <PanGestureHandler onGestureEvent={maxGestureHandler}>
                        <Animated.View
                            style={[
                                maxThumbStyle,
                                {
                                    position: 'absolute',
                                    top: -((thumbSize - trackHeight) / 2),
                                    width: thumbSize * 1.9,
                                    height: thumbSize,
                                    borderRadius: thumbSize / 2,
                                    backgroundColor: thumbColor,
                                    // shadowColor: '#000',
                                    // shadowOffset: { width: 0, height: 2 },
                                    // shadowOpacity: 0.25,
                                    // shadowRadius: 4,
                                    // elevation: 5,
                                },
                                thumbStyle,
                            ]}
                        />
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
