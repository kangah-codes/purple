import React, { ReactNode } from 'react';
import { TouchableOpacity } from 'react-native';

/**
 * @deprecated Use a regular touchableopacity
 */
export function MenuOption({
    onSelect,
    children,
    onLongPress,
}: {
    onSelect: () => void;
    onLongPress?: () => void;
    children: ReactNode;
}) {
    return (
        <TouchableOpacity onPress={onSelect} onLongPress={onLongPress}>
            {children}
        </TouchableOpacity>
    );
}
