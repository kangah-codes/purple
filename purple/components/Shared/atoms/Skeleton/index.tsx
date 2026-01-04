import React, { memo, useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, ViewStyle } from 'react-native';

type AnimatedSkeletonProps = {
    style: StyleProp<ViewStyle>;
};

function AnimatedSkeleton({ style }: AnimatedSkeletonProps) {
    const animatedValue = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0.5,
                    duration: 1000,
                    useNativeDriver: false,
                }),
            ]),
        );

        animation.start();

        return () => animation.stop();
    }, [animatedValue]);

    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 0.5],
        outputRange: ['#faf5ff', '#f3e8ff'],
    });

    return <Animated.View style={[styles.skeleton, style, { backgroundColor }]} />;
}

const styles = StyleSheet.create({
    skeleton: {
        overflow: 'hidden',
    },
});

export default memo(AnimatedSkeleton);
