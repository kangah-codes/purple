import React, { useRef, useState } from 'react';
import { View, Animated, PanResponder, StyleSheet, Text } from 'react-native';

interface CustomPullToRefreshProps {
    onRefresh: () => Promise<void>;
    refreshHeight?: number;
    children: React.ReactNode;
}

const CustomPullToRefresh: React.FC<CustomPullToRefreshProps> = ({
    onRefresh,
    refreshHeight = 80,
    children,
}) => {
    const [refreshing, setRefreshing] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;
    const isRefreshingRef = useRef(false);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return !isRefreshingRef.current && gestureState.dy > 0;
            },
            onPanResponderMove: (_, gestureState) => {
                // Add resistance to the pull
                const dy = Math.min(gestureState.dy * 0.5, refreshHeight * 1.5);
                scrollY.setValue(dy);
            },
            onPanResponderRelease: async (_, gestureState) => {
                if (gestureState.dy >= refreshHeight && !isRefreshingRef.current) {
                    isRefreshingRef.current = true;
                    setRefreshing(true);

                    // Snap to refresh height
                    Animated.spring(scrollY, {
                        toValue: refreshHeight,
                        useNativeDriver: true,
                    }).start();

                    try {
                        await onRefresh();
                    } finally {
                        // Reset after refresh
                        isRefreshingRef.current = false;
                        setRefreshing(false);
                        Animated.spring(scrollY, {
                            toValue: 0,
                            useNativeDriver: true,
                        }).start();
                    }
                } else {
                    // Snap back if not pulled enough
                    Animated.spring(scrollY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        }),
    ).current;

    return (
        <View style={styles.container}>
            {/* Custom Refresh Component */}
            <Animated.View
                style={[
                    styles.refreshContainer,
                    {
                        transform: [{ translateY: Animated.subtract(0, scrollY) }],
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.refresh,
                        {
                            opacity: scrollY.interpolate({
                                inputRange: [0, refreshHeight],
                                outputRange: [0, 1],
                            }),
                            transform: [
                                {
                                    rotate: scrollY.interpolate({
                                        inputRange: [0, refreshHeight],
                                        outputRange: ['0deg', '360deg'],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    {refreshing ? (
                        <Text style={styles.refreshText}>Refreshing...</Text>
                    ) : (
                        <Text style={styles.refreshText}>↓ Pull to refresh</Text>
                    )}
                </Animated.View>
            </Animated.View>

            {/* Main Content */}
            <Animated.View
                {...panResponder.panHandlers}
                style={[
                    styles.content,
                    {
                        transform: [{ translateY: scrollY }],
                    },
                ]}
            >
                {children}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    content: {
        flex: 1,
        backgroundColor: 'white',
    },
    refreshContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 80,
    },
    refresh: {
        height: 40,
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    refreshText: {
        color: '#999',
    },
});

export default CustomPullToRefresh;
