import React, {
    useEffect,
    useState,
    useCallback,
    useImperativeHandle,
    forwardRef,
    memo,
} from 'react';

import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    interpolate,
    Easing,
} from 'react-native-reanimated';

import { View } from '@/components/Shared/styled';

interface AnimatedCollapsibleProps {
    /**
     * Whether the collapsible should start open.
     */
    defaultOpen?: boolean;

    /**
     * Explicit controlled state (optional).
     */
    open?: boolean;

    /**
     * Event fired when opened.
     */
    onOpen?: () => void;

    /**
     * Event fired when closed.
     */
    onClose?: () => void;

    /**
     * Event fired when toggled.
     */
    onToggle?: (open: boolean) => void;

    /**
     * Duration of animation.
     */
    animationDuration?: number;

    /**
     * Content to render inside the collapsible.
     */
    children: React.ReactNode;

    /**
     * Extra className support for styling
     */
    className?: string;

    /**
     * Optional style
     */
    style?: any;
}

export interface AnimatedCollapsibleRef {
    open: () => void;
    close: () => void;
    toggle: () => void;
}

const AnimatedCollapsibleComponent = forwardRef<AnimatedCollapsibleRef, AnimatedCollapsibleProps>(
    (
        {
            defaultOpen = false,
            open: controlledOpen,
            onOpen,
            onClose,
            onToggle,
            animationDuration = 300,
            children,
            className = '',
            style,
        },
        ref,
    ) => {
        /**
         * Internal state if uncontrolled.
         */
        const [internalOpen, setInternalOpen] = useState(defaultOpen);
        const isControlled = controlledOpen !== undefined;
        const isOpen = isControlled ? controlledOpen! : internalOpen;

        const [contentHeight, setContentHeight] = useState(0);
        const [isMeasured, setIsMeasured] = useState(false);
        const [renderContent, setRenderContent] = useState(defaultOpen);

        const heightValue = useSharedValue(defaultOpen ? 1 : 0);

        /**
         * Expose imperative handle
         */
        useImperativeHandle(
            ref,
            () => ({
                open: () => updateState(true),
                close: () => updateState(false),
                toggle: () => updateState(!isOpen),
            }),
            [isOpen],
        );

        const updateState = (next: boolean) => {
            if (!isControlled) {
                setInternalOpen(next);
            }

            if (next) onOpen?.();
            else onClose?.();
            onToggle?.(next);
        };

        /**
         * Mount content when opening
         */
        useEffect(() => {
            if (isOpen && !renderContent) {
                setRenderContent(true);
            }
        }, [isOpen, renderContent]);

        /**
         * Animate height
         */
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
        }, [isOpen, animationDuration, isMeasured]);

        const onContentLayout = useCallback(
            (e: any) => {
                const h = e.nativeEvent.layout.height;
                if (h > 0 && (!isMeasured || h !== contentHeight)) {
                    setContentHeight(h);
                    setIsMeasured(true);
                }
            },
            [contentHeight, isMeasured],
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

        return (
            <View className={className} style={style}>
                {renderContent && (
                    <Animated.View style={[animatedHeightStyle, { overflow: 'hidden' }]}>
                        <View onLayout={onContentLayout}>{children}</View>
                    </Animated.View>
                )}
            </View>
        );
    },
);

export const AnimatedCollapsible = memo(AnimatedCollapsibleComponent);
