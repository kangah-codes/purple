import React from 'react';
import { TouchableOpacity } from '@/components/Shared/styled';
import { useCollapsibleContext } from './CollapsibleContext';

interface CollapsibleTriggerProps {
    children: React.ReactNode;
    asChild?: boolean;
    className?: string;
    style?: any;
}

export function CollapsibleTrigger({
    children,
    asChild = false,
    className = '',
    style,
}: CollapsibleTriggerProps) {
    const { toggle } = useCollapsibleContext();

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onPress: () => {
                const originalOnPress = (children as any).props?.onPress;
                originalOnPress?.();
                toggle();
            },
        });
    }

    return (
        <TouchableOpacity onPress={toggle} className={className} style={style}>
            {children}
        </TouchableOpacity>
    );
}
