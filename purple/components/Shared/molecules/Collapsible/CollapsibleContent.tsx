import React, { useEffect, useState, useCallback } from 'react';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    interpolate,
    Easing,
} from 'react-native-reanimated';
import { View } from '@/components/Shared/styled';
import { useCollapsibleContext } from './CollapsibleContext';

interface CollapsibleContentProps {
    children: React.ReactNode;
    className?: string;
    style?: any;
}

export function CollapsibleContent({ children, className = '', style }: CollapsibleContentProps) {
    const {
        isOpen,
        animationDuration,
        contentHeight,
        setContentHeight,
        isMeasured,
        setIsMeasured,
    } = useCollapsibleContext();

    const [renderContent, setRenderContent] = useState(isOpen);
    const heightValue = useSharedValue(isOpen ? 1 : 0);

    // Mount content when opening
    useEffect(() => {
        if (isOpen && !renderContent) {
            setRenderContent(true);
        }
    }, [isOpen, renderContent]);

    // Animate height
    useEffect(() => {
        if (!isMeasured) return;

        heightValue.value = withTiming(isOpen ? 1 : 0, {
            duration: animationDuration,
            easing: Easing.out(Easing.cubic),
        });

        if (!isOpen) {
            const timeout = setTimeout(() => setRenderContent(false), animationDuration);
            return () => clearTimeout(timeout);
        }
    }, [isOpen, animationDuration, isMeasured, heightValue]);

    const onContentLayout = useCallback(
        (e: any) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && (!isMeasured || h !== contentHeight)) {
                setContentHeight(h);
                setIsMeasured(true);
            }
        },
        [contentHeight, isMeasured, setContentHeight, setIsMeasured],
    );

    const animatedHeightStyle = useAnimatedStyle(() => {
        if (!isMeasured) {
            return { height: undefined, opacity: 0 };
        }

        return {
            height: interpolate(heightValue.value, [0, 1], [0, contentHeight]),
            opacity: interpolate(heightValue.value, [0, 0.2, 1], [0, 0, 1]),
        };
    });

    if (!renderContent) return null;

    return (
        <Animated.View style={[animatedHeightStyle, { overflow: 'hidden' }, style]}>
            <View onLayout={onContentLayout} className={className}>
                {children}
            </View>
        </Animated.View>
    );
}
