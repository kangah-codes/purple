import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    interpolate,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { ChevronDownIcon } from '@/components/SVG/icons/16x16';
import { Text, View } from '@/components/Shared/styled';

export interface AccordionItem {
    id: string;
    title: string;
    content: React.ReactNode;
    defaultExpanded?: boolean;
}

interface AnimatedAccordionProps {
    items: AccordionItem[];
    className?: string;
    titleClassName?: string;
    contentClassName?: string;
    chevronColor?: string;
    titleStyle?: any;
    allowMultiple?: boolean; // Allow multiple items to be expanded at once
    animationDuration?: number;
}

export default function AnimatedAccordion({
    items,
    className = '',
    titleClassName = '',
    contentClassName = '',
    chevronColor = '#9333EA',
    titleStyle,
    allowMultiple = false,
    animationDuration = 300,
}: AnimatedAccordionProps) {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(
        new Set(items.filter(item => item.defaultExpanded).map(item => item.id))
    );

    const toggleItem = (itemId: string) => {
        setExpandedItems(prev => {
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
            {items.map((item, index) => (
                <AccordionItemComponent
                    key={item.id}
                    item={item}
                    isExpanded={expandedItems.has(item.id)}
                    onToggle={() => toggleItem(item.id)}
                    titleClassName={titleClassName}
                    contentClassName={contentClassName}
                    chevronColor={chevronColor}
                    titleStyle={titleStyle}
                    animationDuration={animationDuration}
                    isLast={index === items.length - 1}
                />
            ))}
        </View>
    );
}

interface AccordionItemComponentProps {
    item: AccordionItem;
    isExpanded: boolean;
    onToggle: () => void;
    titleClassName: string;
    contentClassName: string;
    chevronColor: string;
    titleStyle?: any;
    animationDuration: number;
    isLast: boolean;
}

function AccordionItemComponent({
    item,
    isExpanded,
    onToggle,
    titleClassName,
    contentClassName,
    chevronColor,
    titleStyle,
    animationDuration,
    isLast,
}: AccordionItemComponentProps) {
    const [contentHeight, setContentHeight] = useState(0);
    const heightValue = useSharedValue(isExpanded ? 1 : 0);
    const rotationValue = useSharedValue(isExpanded ? 1 : 0);

    React.useEffect(() => {
        heightValue.value = withTiming(
            isExpanded ? 1 : 0,
            {
                duration: animationDuration,
                easing: Easing.out(Easing.cubic),
            }
        );
        rotationValue.value = withTiming(
            isExpanded ? 1 : 0,
            {
                duration: animationDuration,
                easing: Easing.out(Easing.cubic),
            }
        );
    }, [isExpanded, animationDuration]);

    const animatedHeightStyle = useAnimatedStyle(() => {
        const height = interpolate(
            heightValue.value,
            [0, 1],
            [0, contentHeight]
        );
        return {
            height,
            opacity: interpolate(heightValue.value, [0, 0.5, 1], [0, 0.5, 1]),
        };
    });

    const animatedChevronStyle = useAnimatedStyle(() => {
        const rotation = interpolate(
            rotationValue.value,
            [0, 1],
            [0, 180]
        );
        return {
            transform: [{ rotate: `${rotation}deg` }],
        };
    });

    const onContentLayout = (event: any) => {
        const { height } = event.nativeEvent.layout;
        if (contentHeight === 0) {
            setContentHeight(height);
        }
    };

    return (
        <View className={`w-full ${!isLast ? 'mb-4' : ''}`}>
            <TouchableOpacity
                onPress={onToggle}
                className={`w-full flex flex-row justify-between items-center px-5 py-4 ${titleClassName}`}
                activeOpacity={0.7}
            >
                <Text
                    style={titleStyle}
                    className="text-sm text-gray-900 flex-1"
                >
                    {item.title}
                </Text>
                
                <Animated.View style={animatedChevronStyle}>
                    <ChevronDownIcon
                        width={16}
                        height={16}
                        stroke={chevronColor}
                        strokeWidth={2}
                    />
                </Animated.View>
            </TouchableOpacity>

            <Animated.View
                style={[animatedHeightStyle, { overflow: 'hidden' }]}
            >
                <View
                    onLayout={onContentLayout}
                    className={`w-full ${contentClassName}`}
                >
                    {item.content}
                </View>
            </Animated.View>
        </View>
    );
}