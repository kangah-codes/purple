import { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

export const MenuOption = ({
    onSelect,
    children,
}: {
    onSelect: () => void;
    children: ReactNode;
}) => {
    return (
        <TouchableOpacity onPress={onSelect} style={styles.menuOption}>
            {children}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    menuOption: {
        padding: 5,
    },
});
