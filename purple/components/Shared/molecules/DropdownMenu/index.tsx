import React, { useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
    Dimensions,
    ScrollView,
} from 'react-native';

interface DropdownOption {
    renderLabel: () => React.ReactNode;
    onPress?: () => void;
}

interface DropdownMenuProps {
    renderTrigger: () => React.ReactNode;
    options: DropdownOption[];
    spacing?: number;
    animationDuration?: number;
    style?: ViewStyle;
    dropdownStyle?: ViewStyle;
    optionStyle?: ViewStyle;
    screenPadding?: number;
    dropdownWidth?: number;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
    renderTrigger,
    options,
    spacing = 8,
    animationDuration = 200,
    style,
    dropdownStyle,
    optionStyle,
    screenPadding = 16,
    dropdownWidth = 180,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [layout, setLayout] = useState<{
        top: number;
        left: number;
        maxHeight: number;
    } | null>(null);

    const containerRef = useRef<View>(null);
    const screen = Dimensions.get('window');

    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.95)).current;

    function measureAndOpen() {
        if (!containerRef.current) return;

        containerRef.current.measureInWindow((x, y, width, height) => {
            const dropdownHeight = options.length * 44 + 16;

            const spaceBelow = screen.height - (y + height + spacing) - screenPadding;
            const spaceAbove = y - spacing - screenPadding;

            let top = y + height + spacing;
            let maxHeight = dropdownHeight;

            if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
                // open above
                top = Math.max(screenPadding, y - spacing - Math.min(spaceAbove, dropdownHeight));
                maxHeight = Math.min(spaceAbove, dropdownHeight);
            } else {
                // open below
                top = Math.min(
                    y + height + spacing,
                    screen.height - screenPadding - Math.min(spaceBelow, dropdownHeight),
                );
                maxHeight = Math.min(spaceBelow, dropdownHeight);
            }

            // Clamp horizontal
            let left = x;
            if (x + dropdownWidth > screen.width - screenPadding) {
                left = screen.width - screenPadding - dropdownWidth;
            }
            if (left < screenPadding) left = screenPadding;

            setLayout({ top, left, maxHeight });

            setIsOpen(true);
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: animationDuration,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 1,
                    duration: animationDuration,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    }

    function close() {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: animationDuration,
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: 0.95,
                duration: animationDuration,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsOpen(false);
            setLayout(null);
        });
    }

    function toggle() {
        if (isOpen) close();
        else measureAndOpen();
    }

    function handleOptionPress(option: DropdownOption) {
        option.onPress?.();
        close();
    }

    return (
        <>
            {isOpen && (
                <TouchableOpacity
                    style={StyleSheet.absoluteFillObject}
                    activeOpacity={1}
                    onPress={close}
                />
            )}

            <View ref={containerRef} style={[style]}>
                <TouchableOpacity activeOpacity={0.8} onPress={toggle}>
                    {renderTrigger()}
                </TouchableOpacity>
            </View>

            {isOpen && layout && (
                <Animated.View
                    style={[
                        styles.dropdown,
                        {
                            top: layout.top,
                            left: layout.left,
                            width: dropdownWidth,
                            maxHeight: layout.maxHeight,
                            opacity,
                            transform: [{ scale }],
                        },
                        dropdownStyle,
                    ]}
                >
                    <ScrollView style={{ maxHeight: layout.maxHeight }}>
                        {options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.option, optionStyle]}
                                onPress={() => handleOptionPress(option)}
                                activeOpacity={0.7}
                            >
                                {option.renderLabel()}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    dropdown: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        overflow: 'hidden',
        zIndex: 100,
    },
    option: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 44,
        justifyContent: 'center',
    },
});

export default DropdownMenu;
