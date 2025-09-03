import React, { useEffect, useRef } from 'react';
import { View } from '../../styled';
import { StyleProp, ViewStyle, Animated } from 'react-native';

type ProgressBarProps = {
    steps: number;
    currentStep: number;
    dotStyle?: StyleProp<ViewStyle>;
};

export function ProgressBar({
    steps,
    currentStep,
    dotStyle = { borderColor: '#faf5ff' },
}: ProgressBarProps) {
    const segments = Array.from({ length: steps }, (_, i) => i < currentStep);

    // Animated values
    const dotPosition = useRef(new Animated.Value(0)).current;
    const segmentColors = useRef(
        Array.from({ length: steps }, () => new Animated.Value(0)),
    ).current;

    // Calculate the target position of the single dot based on current step
    const targetDotPosition = (currentStep / steps) * 100;

    // Animate dot position
    useEffect(() => {
        Animated.spring(dotPosition, {
            toValue: targetDotPosition,
            useNativeDriver: false,
            tension: 50,
            friction: 8,
        }).start();
    }, [currentStep, steps, dotPosition, targetDotPosition]);

    // Animate segment colors
    useEffect(() => {
        const animations = segments.map((isComplete, i) => {
            return Animated.spring(segmentColors[i], {
                toValue: isComplete ? 1 : 0,
                useNativeDriver: false,
                tension: 100,
                friction: 8,
            });
        });

        Animated.parallel(animations).start();
    }, [currentStep, segments, segmentColors]);

    return (
        <View className='w-full flex flex-row items-center space-x-1 relative'>
            {segments.map((isComplete, i) => (
                <Animated.View
                    key={i}
                    style={{
                        height: 6,
                        flex: 1,
                        borderRadius: 9999,
                        backgroundColor: segmentColors[i].interpolate({
                            inputRange: [0, 1],
                            outputRange: ['#dab2ff', '#8b5cf6'], // gray-300 to purple-500
                        }),
                    }}
                />
            ))}

            <Animated.View
                style={[
                    {
                        height: 24,
                        width: 24,
                        borderRadius: 12,
                        borderWidth: 2,
                        backgroundColor: '#8b5cf6',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        position: 'absolute',
                        left: dotPosition.interpolate({
                            inputRange: [0, 100],
                            // hack so the dot doesnt go past the bar
                            outputRange: ['0%', '96%'],
                        }),
                        zIndex: 1,
                        top: -10,
                        transform: [{ translateX: -12 }],
                    },
                    dotStyle,
                ]}
            />
        </View>
    );
}
