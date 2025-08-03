import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

interface FABOption {
    renderContent: () => React.ReactNode;
    onPress?: () => void;
}

interface Position {
    right?: number;
    left?: number;
    top?: number;
    bottom?: number;
}

interface AnimatedFABProps {
    renderMainContent: () => React.ReactNode;
    options?: FABOption[];
    position: Position;
    spacing?: number;
    animationDuration?: number;
    style?: ViewStyle;
}

const AnimatedFAB: React.FC<AnimatedFABProps> = ({
    renderMainContent,
    position,
    options = [],
    spacing = 12,
    animationDuration = 200,
    style,
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const animatedValues = useRef(
        options.map(() => ({
            opacity: new Animated.Value(0),
            translateY: new Animated.Value(16),
            scale: new Animated.Value(0.8),
        })),
    ).current;
    const rotationValue = useRef(new Animated.Value(0)).current;

    const animateMenu = (opening: boolean) => {
        const toValue = opening ? 1 : 0;

        // Animate main button rotation
        Animated.timing(rotationValue, {
            toValue,
            duration: animationDuration,
            useNativeDriver: true,
        }).start();

        // Animate action buttons
        const animations = animatedValues.map((values, index) => {
            const delay = opening ? index * 50 : (options.length - 1 - index) * 50;

            return Animated.parallel([
                Animated.timing(values.opacity, {
                    toValue: opening ? 1 : 0,
                    duration: animationDuration,
                    delay,
                    useNativeDriver: true,
                }),
                Animated.timing(values.translateY, {
                    toValue: opening ? 0 : 16,
                    duration: animationDuration,
                    delay,
                    useNativeDriver: true,
                }),
                Animated.timing(values.scale, {
                    toValue: opening ? 1 : 0.8,
                    duration: animationDuration,
                    delay,
                    useNativeDriver: true,
                }),
            ]);
        });

        Animated.parallel(animations).start(() => {
            if (!opening) {
                setIsMenuOpen(false);
            }
        });
    };

    const toggleMenu = () => {
        if (isMenuOpen) {
            animateMenu(false);
        } else {
            setIsMenuOpen(true);
            // delay to ensure the view is rendered before animating
            setTimeout(() => animateMenu(true), 16);
        }
    };

    const closeMenu = () => {
        if (isMenuOpen) {
            animateMenu(false);
        }
    };

    const handleOptionPress = (option: FABOption, index: number): void => {
        if (option.onPress) {
            option.onPress();
        }
        closeMenu();
    };

    const rotation = rotationValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg'],
    });

    return (
        <>
            {/* overlay to detect outside clicks */}
            {isMenuOpen && (
                <TouchableOpacity
                    style={StyleSheet.absoluteFillObject}
                    activeOpacity={1}
                    onPress={closeMenu}
                />
            )}

            <View style={[styles.container, position, style]} pointerEvents='box-none'>
                {/* Action Buttons */}
                {isMenuOpen && (
                    <View style={[styles.optionsContainer, { marginBottom: spacing }]}>
                        {options.map((option, index) => (
                            <Animated.View
                                key={index}
                                style={[
                                    {
                                        opacity: animatedValues[index].opacity,
                                        transform: [
                                            { translateY: animatedValues[index].translateY },
                                            { scale: animatedValues[index].scale },
                                        ],
                                    },
                                    index < options.length - 1 && { marginBottom: spacing },
                                ]}
                            >
                                <TouchableOpacity
                                    onPress={() => handleOptionPress(option, index)}
                                    activeOpacity={0.8}
                                >
                                    {option.renderContent()}
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                )}

                <Animated.View
                    style={{
                        transform: [{ rotate: rotation }],
                    }}
                >
                    <TouchableOpacity activeOpacity={0.8} onPress={toggleMenu}>
                        {renderMainContent()}
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignItems: 'flex-end',
        zIndex: 10,
    },
    optionsContainer: {
        alignItems: 'flex-end',
    },
    actionButton: {
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

export default AnimatedFAB;
