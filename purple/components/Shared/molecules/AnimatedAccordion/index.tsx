import React, { useEffect, useState, memo, useCallback } from 'react';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    interpolate,
    Easing,
} from 'react-native-reanimated';
import { ChevronDownIcon } from '@/components/SVG/icons/16x16';
import { Text, View, TouchableOpacity } from '@/components/Shared/styled';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface AccordionItem {
    id: string;
    title: string;
    content: React.ReactNode;
    defaultExpanded?: boolean;
}

interface AnimatedAccordionProps {
    items: AccordionItem[];
    className?: string;
    chevronColor?: string;
    titleStyle?: {
        text?: StyleProp<TextStyle>;
        container?: StyleProp<ViewStyle>;
    };
    allowMultiple?: boolean;
    animationDuration?: number;
}

export default function AnimatedAccordion({
    items,
    className = '',
    chevronColor = '#9333EA',
    titleStyle,
    allowMultiple = false,
    animationDuration = 300,
}: AnimatedAccordionProps) {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(
        new Set(items.filter((item) => item.defaultExpanded).map((item) => item.id)),
    );

    const toggleItem = useCallback(
        (itemId: string) => {
            setExpandedItems((prev) => {
                const newSet = new Set(prev);
                if (newSet.has(itemId)) {
                    newSet.delete(itemId);
                } else {
                    if (!allowMultiple) newSet.clear();
                    newSet.add(itemId);
                }
                return newSet;
            });
        },
        [allowMultiple],
    );

    return (
        <View className={`w-full flex flex-col ${className}`} removeClippedSubviews>
            {items.map((item) => (
                <MemoizedAccordionItem
                    key={item.id}
                    item={item}
                    isExpanded={expandedItems.has(item.id)}
                    onToggle={() => toggleItem(item.id)}
                    chevronColor={chevronColor}
                    titleStyle={titleStyle}
                    animationDuration={animationDuration}
                />
            ))}
        </View>
    );
}

interface AccordionItemComponentProps {
    item: AccordionItem;
    isExpanded: boolean;
    onToggle: () => void;
    chevronColor: string;
    titleStyle?: {
        text?: StyleProp<TextStyle>;
        container?: StyleProp<ViewStyle>;
    };
    animationDuration: number;
}

const AccordionItemComponent = ({
    item,
    isExpanded,
    onToggle,
    chevronColor,
    titleStyle,
    animationDuration,
}: AccordionItemComponentProps) => {
    const [contentHeight, setContentHeight] = useState(0);
    const [isContentMeasured, setIsContentMeasured] = useState(false);
    const [isMounted, setIsMounted] = useState(item.defaultExpanded ?? false);
    const heightValue = useSharedValue(isExpanded ? 1 : 0);
    const rotationValue = useSharedValue(isExpanded ? 1 : 0);

    useEffect(() => {
        if (isExpanded && !isMounted) {
            setIsMounted(true);
        }
    }, [isExpanded, isMounted]);

    useEffect(() => {
        if (isContentMeasured) {
            heightValue.value = withTiming(isExpanded ? 1 : 0, {
                duration: animationDuration,
                easing: Easing.out(Easing.cubic),
            });
        }

        rotationValue.value = withTiming(isExpanded ? 1 : 0, {
            duration: animationDuration,
            easing: Easing.out(Easing.cubic),
        });
    }, [isExpanded, animationDuration, isContentMeasured]);

    useEffect(() => {
        if (!isExpanded && isMounted) {
            const timeout = setTimeout(() => {
                setIsMounted(false);
            }, animationDuration);
            return () => clearTimeout(timeout);
        }
    }, [isExpanded, isMounted, animationDuration]);

    const animatedHeightStyle = useAnimatedStyle(() => {
        if (!isContentMeasured || contentHeight === 0) {
            return {
                height: undefined,
                opacity: 0,
            };
        }

        const height = interpolate(heightValue.value, [0, 1], [0, contentHeight]);
        const opacity = interpolate(heightValue.value, [0, 0.3, 1], [0, 0, 1]);

        return {
            height,
            opacity,
        };
    });

    const animatedChevronStyle = useAnimatedStyle(() => {
        const rotation = interpolate(rotationValue.value, [0, 1], [0, 180]);
        return {
            transform: [{ rotate: `${rotation}deg` }],
        };
    });

    const onContentLayout = useCallback(
        (event: any) => {
            const { height } = event.nativeEvent.layout;
            if (height > 0 && (!isContentMeasured || height !== contentHeight)) {
                setContentHeight(height);
                setIsContentMeasured(true);
            }
        },
        [isContentMeasured, contentHeight],
    );

    return (
        <View className='w-full'>
            <TouchableOpacity
                onPress={onToggle}
                className='w-full flex flex-row justify-between items-center px-5 py-4'
                activeOpacity={0.7}
                style={titleStyle?.container}
            >
                <Text style={titleStyle?.text} className='flex-1'>
                    {item.title}
                </Text>

                <Animated.View style={animatedChevronStyle}>
                    <ChevronDownIcon width={16} height={16} stroke={chevronColor} strokeWidth={2} />
                </Animated.View>
            </TouchableOpacity>

            {isMounted && (
                <Animated.View style={[animatedHeightStyle, { overflow: 'hidden' }]}>
                    <View onLayout={onContentLayout} className='w-full'>
                        {item.content}
                    </View>
                </Animated.View>
            )}
        </View>
    );
};

const MemoizedAccordionItem = memo(AccordionItemComponent);
