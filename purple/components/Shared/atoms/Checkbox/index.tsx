import { CheckMarkIcon } from '@/components/SVG/icons/noscale';
import { Text, View } from '@/components/Shared/styled';
import React from 'react';
import { Pressable, StyleSheet, TextStyle, ViewStyle } from 'react-native';

type CheckboxProps = {
    label?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    size?: number;
    checkedColor?: string;
    uncheckedColor?: string;
    labelStyle?: TextStyle;
    boxStyle?: ViewStyle;
    disabled?: boolean;
};

export default function Checkbox({
    label,
    checked,
    onChange,
    disabled,
    size = 24,
    checkedColor = '#9810fa',
    uncheckedColor = '#fff',
    labelStyle = {},
    boxStyle = {},
}: CheckboxProps) {
    const checkMarkIconSize = size * 0.6;

    return (
        <Pressable disabled={disabled} style={styles.container} onPress={() => onChange(!checked)}>
            <View
                style={[
                    styles.checkbox,
                    {
                        width: size,
                        height: size,
                        borderColor: checked ? checkedColor : '#f3e8ff',
                        backgroundColor: checked ? checkedColor : uncheckedColor,
                    },
                    boxStyle,
                ]}
                className='border-[1.5px] rounded-full justify-center items-center mr-[8px]'
            >
                {checked && (
                    <CheckMarkIcon
                        strokeWidth={3}
                        stroke={'#fff'}
                        width={checkMarkIconSize}
                        height={checkMarkIconSize}
                    />
                )}
            </View>
            {label && (
                <Text style={[labelStyle]} className='text-base'>
                    {label}
                </Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        borderWidth: 2,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
});
