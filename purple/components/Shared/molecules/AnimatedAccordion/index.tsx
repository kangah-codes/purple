import React, { useEffect, useState } from 'react';
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

    const toggleItem = (itemId: string) => {
        setExpandedItems((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                if (!allowMultiple) {
                    newSet.clear();
                }
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    return (
        <View className={`w-full flex flex-col ${className}`}>
            {items.map((item) => (
                <AccordionItemComponent
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

function AccordionItemComponent({
    item,
    isExpanded,
    onToggle,
    chevronColor,
    titleStyle,
    animationDuration,
}: AccordionItemComponentProps) {
    const [contentHeight, setContentHeight] = useState(0);
    const [isContentMeasured, setIsContentMeasured] = useState(false);
    const heightValue = useSharedValue(isExpanded ? 1 : 0);
    const rotationValue = useSharedValue(isExpanded ? 1 : 0);

    useEffect(() => {
        // animate if content has been measured
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

    // update height animation when contentHeight changes
    useEffect(() => {
        if (isContentMeasured && isExpanded && contentHeight > 0) {
            heightValue.value = withTiming(1, {
                duration: animationDuration,
                easing: Easing.out(Easing.cubic),
            });
        }
    }, [contentHeight, isContentMeasured, isExpanded, animationDuration]);

    const animatedHeightStyle = useAnimatedStyle(() => {
        if (!isContentMeasured) {
            return {
                height: undefined,
                opacity: isExpanded ? 1 : 0,
            };
        }

        const height = interpolate(heightValue.value, [0, 1], [0, contentHeight]);
        return {
            height,
            opacity: interpolate(heightValue.value, [0, 0.5, 1], [0, 0.5, 1]),
        };
    });

    const animatedChevronStyle = useAnimatedStyle(() => {
        const rotation = interpolate(rotationValue.value, [0, 1], [0, 180]);
        return {
            transform: [{ rotate: `${rotation}deg` }],
        };
    });

    const onContentLayout = (event: any) => {
        const { height } = event.nativeEvent.layout;
        // update height whenever it changes
        if (height > 0) {
            setContentHeight(height);
            if (!isContentMeasured) {
                setIsContentMeasured(true);
                // set initial height value after measurement
                heightValue.value = isExpanded ? 1 : 0;
            }
        }
    };

    return (
        <View className={`w-full`}>
            <TouchableOpacity
                onPress={onToggle}
                className={['w-full flex flex-row justify-between items-center px-5 py-4']
                    .filter(Boolean)
                    .join(' ')}
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

            <Animated.View style={[animatedHeightStyle, { overflow: 'hidden' }]}>
                <View onLayout={onContentLayout} className={`w-full`}>
                    {item.content}
                </View>
            </Animated.View>
        </View>
    );
}
