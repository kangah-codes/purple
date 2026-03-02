import { createContext, useContext } from 'react';

interface CollapsibleContextValue {
    isOpen: boolean;
    toggle: () => void;
    open: () => void;
    close: () => void;
    animationDuration: number;
    contentHeight: number;
    setContentHeight: (height: number) => void;
    isMeasured: boolean;
    setIsMeasured: (measured: boolean) => void;
}

export const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

export function useCollapsibleContext() {
    const context = useContext(CollapsibleContext);
    if (!context) {
        throw new Error('Collapsible compound components must be used within Collapsible.Root');
    }
    return context;
}
