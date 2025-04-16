import React, { ReactNode } from 'react';
import { TouchableOpacity } from 'react-native';

export const MenuOption = ({
    onSelect,
    children,
}: {
    onSelect: () => void;
    children: ReactNode;
}) => {
    return <TouchableOpacity onPress={onSelect}>{children}</TouchableOpacity>;
};
