import { satoshiFont } from '@/lib/constants/fonts';
import React, { useEffect, useRef } from 'react';
import {
    Text,
    TouchableOpacity,
    LayoutChangeEvent,
    StyleSheet,
    ViewStyle,
    StyleProp,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { View } from '../../styled';

type Option<T> = {
    label: string;
    value: T;
};

interface AnimatedPillSelectProps<T> {
    options: Option<T>[];
    selected: T;
    onChange: (val: T) => void;
    styling?: {
        pill?: StyleProp<ViewStyle>;
        background?: StyleProp<ViewStyle>;
        option?: StyleProp<ViewStyle>;
        activeText?: StyleProp<ViewStyle>;
        inactiveText?: StyleProp<ViewStyle>;
    };
    renderItem?: (opt: Option<T>, selected: boolean) => React.ReactNode;
}

export function AnimatedPillSelect<T extends string | number>({
    options,
    selected,
    onChange,
    styling = {},
    renderItem,
}: AnimatedPillSelectProps<T>) {
    const indicatorX = useSharedValue(0);
    const indicatorW = useSharedValue(0);

    // @ts-ignore
    const layouts = useRef<Record<T, { x: number; width: number }>>({});

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: indicatorX.value }],
        width: indicatorW.value,
    }));

    const handleLayout = (e: LayoutChangeEvent, value: T) => {
        const { x, width } = e.nativeEvent.layout;
        layouts.current[value] = { x, width };

        if (value === selected) {
            indicatorX.value = withSpring(x, { damping: 15, stiffness: 150 });
            indicatorW.value = withSpring(width, { damping: 15, stiffness: 150 });
        }
    };

    useEffect(() => {
        const layout = layouts.current[selected];
        if (layout) {
            indicatorX.value = withSpring(layout.x, { damping: 15, stiffness: 150 });
            indicatorW.value = withSpring(layout.width, { damping: 15, stiffness: 150 });
        }
    }, [selected]);

    return (
        <View style={[styles.container, styling.background]} className=''>
            <Animated.View style={[styles.indicator, animatedStyle, styling.pill]} />
            {options.map((opt) => {
                const isSelected = opt.value === selected;
                return (
                    <TouchableOpacity
                        key={String(opt.value)}
                        onPress={() => onChange(opt.value)}
                        onLayout={(e) => handleLayout(e, opt.value)}
                        style={[styles.option, styling.option]}
                        activeOpacity={0.8}
                    >
                        {renderItem ? (
                            renderItem(opt, isSelected)
                        ) : (
                            <Text
                                style={[
                                    styles.text,
                                    satoshiFont.satoshiBlack,
                                    isSelected
                                        ? [styles.activeText, styling.activeText]
                                        : [styles.inactiveText, styling.inactiveText],
                                ]}
                            >
                                {opt.label}
                            </Text>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        position: 'relative',
    },
    indicator: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        borderRadius: 999,
        backgroundColor: 'white',
    },
    option: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
    },
    text: {
        fontSize: 12,
    },
    activeText: {
        color: '#8200db',
    },
    inactiveText: {
        color: '#c27aff',
    },
});
