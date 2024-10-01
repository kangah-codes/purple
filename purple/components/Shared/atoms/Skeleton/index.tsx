import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, StyleProp, ViewStyle } from 'react-native';

type AnimatedSkeletonProps = {
    style: StyleProp<ViewStyle>;
};

export default function AnimatedSkeleton({ style }: AnimatedSkeletonProps) {
    console.log(style);
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: false,
                }),
            ]),
        );

        animation.start();

        return () => animation.stop();
    }, [animatedValue]);

    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#E0E0E0', '#F5F5F5'],
    });

    return <Animated.View style={[styles.skeleton, style, { backgroundColor }]} />;
}

const styles = StyleSheet.create({
    skeleton: {
        overflow: 'hidden',
    },
});
