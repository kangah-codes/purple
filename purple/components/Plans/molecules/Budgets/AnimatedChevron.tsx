import React from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { ChevronDownIcon } from '@/components/SVG/icons/16x16';

interface AnimatedChevronProps {
    isOpen: boolean;
}

export function AnimatedChevron({ isOpen }: AnimatedChevronProps) {
    const rotation = useSharedValue(0);

    React.useEffect(() => {
        rotation.value = withTiming(isOpen ? 180 : 0, { duration: 300 });
    }, [isOpen, rotation]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
        <Animated.View style={animatedStyle}>
            <ChevronDownIcon width={14} height={14} stroke='#9333EA' strokeWidth={2} />
        </Animated.View>
    );
}
