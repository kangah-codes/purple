import React, { useEffect } from 'react';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    interpolate,
    Easing,
} from 'react-native-reanimated';
import { TouchableOpacity, Text } from '@/components/Shared/styled';
import { XIcon } from '@/components/SVG/icons/noscale';
import { satoshiFont } from '@/lib/constants/fonts';
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
    selectedIconColor?: string;
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
    iconColor = '#6B7280',
    selectedIconColor = '#9333EA',
    borderColor = '#E5E7EB',
    selectedBorderColor = '#9333EA',
}: SelectablePillProps) {
    const iconOpacity = useSharedValue(isSelected ? 1 : 0);
    const iconScale = useSharedValue(isSelected ? 1 : 0);
    const iconWidth = useSharedValue(isSelected ? 22 : 0);

    useEffect(() => {
        iconOpacity.value = withTiming(isSelected ? 1 : 0, {
            duration: animationDuration,
            easing: Easing.out(Easing.cubic),
        });
        iconScale.value = withTiming(isSelected ? 1 : 0, {
            duration: animationDuration,
            easing: Easing.out(Easing.cubic),
        });
        iconWidth.value = withTiming(isSelected ? 22 : 0, {
            duration: animationDuration,
            easing: Easing.out(Easing.cubic),
        });
    }, [isSelected, animationDuration]);

    const animatedContainerStyle = useAnimatedStyle(() => ({
        borderColor: isSelected ? selectedBorderColor : borderColor,
        borderWidth: 1,
    }));

    const animatedIconStyle = useAnimatedStyle(() => ({
        opacity: iconOpacity.value,
        width: iconWidth.value,
        transform: [
            { scale: iconScale.value },
            { translateX: interpolate(iconScale.value, [0, 1], [8, 0]) },
        ],
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
                    animatedContainerStyle,
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

                <Animated.View style={[animatedIconStyle, tw`items-center justify-center`]}>
                    <XIcon
                        width={14}
                        height={14}
                        stroke={isSelected ? selectedIconColor : iconColor}
                        strokeWidth={3}
                    />
                </Animated.View>
            </Animated.View>
        </TouchableOpacity>
    );
}
