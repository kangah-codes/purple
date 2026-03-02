import React, { useState, useCallback, useMemo } from 'react';
import { View } from '@/components/Shared/styled';
import { CollapsibleContext } from './CollapsibleContext';

interface CollapsibleRootProps {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    animationDuration?: number;
    children: React.ReactNode;
    className?: string;
    style?: any;
}

export function CollapsibleRoot({
    defaultOpen = false,
    open: controlledOpen,
    onOpenChange,
    animationDuration = 300,
    children,
    className = '',
    style,
}: CollapsibleRootProps) {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const [contentHeight, setContentHeight] = useState(0);
    const [isMeasured, setIsMeasured] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const toggle = useCallback(() => {
        const newState = !isOpen;
        if (!isControlled) {
            setInternalOpen(newState);
        }
        onOpenChange?.(newState);
    }, [isOpen, isControlled, onOpenChange]);

    const open = useCallback(() => {
        if (!isControlled) {
            setInternalOpen(true);
        }
        onOpenChange?.(true);
    }, [isControlled, onOpenChange]);

    const close = useCallback(() => {
        if (!isControlled) {
            setInternalOpen(false);
        }
        onOpenChange?.(false);
    }, [isControlled, onOpenChange]);

    const contextValue = useMemo(
        () => ({
            isOpen,
            toggle,
            open,
            close,
            animationDuration,
            contentHeight,
            setContentHeight,
            isMeasured,
            setIsMeasured,
        }),
        [isOpen, toggle, open, close, animationDuration, contentHeight, isMeasured],
    );

    return (
        <CollapsibleContext.Provider value={contextValue}>
            <View className={className} style={style}>
                {children}
            </View>
        </CollapsibleContext.Provider>
    );
}
