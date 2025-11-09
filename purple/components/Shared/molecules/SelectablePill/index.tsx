import { Text, TouchableOpacity } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import React, { useEffect } from 'react';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import tw from 'twrnc';

export interface SelectablePillProps {
    id: string;
    label: string;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
    onDeselect?: (id: string) => void;
    className?: string;
    textClassName?: string;
    selectedClassName?: string;
    selectedTextClassName?: string;
    textStyle?: any;
    selectedTextStyle?: any;
    animationDuration?: number;
    iconColor?: string;
    borderColor?: string;
    selectedBorderColor?: string;
}

export default function SelectablePill({
    id,
    label,
    isSelected = false,
    onSelect,
    onDeselect,
    textStyle,
    selectedTextStyle,
    animationDuration = 250,
    borderColor = '#E5E7EB',
    selectedBorderColor = '#9333EA',
}: SelectablePillProps) {
    const borderProgress = useSharedValue(isSelected ? 1 : 0);

    useEffect(() => {
        borderProgress.value = withTiming(isSelected ? 1 : 0, {
            duration: animationDuration,
            easing: Easing.out(Easing.cubic),
        });
    }, [isSelected, animationDuration]);

    const animatedStyle = useAnimatedStyle(() => ({
        borderColor: isSelected ? selectedBorderColor : borderColor,
        borderWidth: 1,
    }));

    const handlePress = () => {
        if (isSelected) onDeselect?.(id);
        else onSelect?.(id);
    };

    const currentTextStyle = isSelected ? selectedTextStyle : textStyle;

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
            <Animated.View
                style={[
                    animatedStyle,
                    tw`rounded-full px-2 py-1 items-center justify-center flex flex-row bg-purple-100`,
                ]}
            >
                <Text
                    style={[
                        {
                            color: isSelected ? '#9810fa' : '#c27aff',
                        },
                        currentTextStyle,
                        satoshiFont.satoshiBold,
                    ]}
                    numberOfLines={1}
                >
                    {label}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
}
