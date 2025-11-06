import { styled } from 'nativewind';
import {
    SafeAreaView as _SafeAreaView,
    View as _View,
    Text as _Text,
    TextInput as _TextInput,
    ScrollView as _ScrollView,
    TouchableOpacity as _TouchableOpacity,
    Image as _Image,
    StyleSheet,
    Animated,
} from 'react-native';
import { LinearGradient as _LinearGradient } from 'expo-linear-gradient';
import { BottomSheetModal as _BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useEffect, useRef, useState } from 'react';

const AnimatedTextInput = Animated.createAnimatedComponent(_TextInput);

function _UnstyledText(props: _Text['props']) {
    return <_Text {...props} style={[props.style]} />;
}

function UnstyledTextInput(props: _TextInput['props'] & { animateBorder?: boolean }) {
    const [isFocused, setIsFocused] = useState(false);
    const borderWidth = useRef(new Animated.Value(1)).current;
    const borderColor = useRef(new Animated.Value(0)).current;
    const shouldAnimateBorder = props.animateBorder ?? true;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(borderWidth, {
                toValue: isFocused ? 3 : 1,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.timing(borderColor, {
                toValue: isFocused ? 1 : 0,
                duration: 200,
                useNativeDriver: false,
            }),
        ]).start();
    }, [isFocused]);

    const animatedBorderColor = borderColor.interpolate({
        inputRange: [0, 1],
        outputRange: ['#e9d5ff', '#9810fa'],
    });

    return (
        <AnimatedTextInput
            {...props}
            onFocus={(e) => {
                setIsFocused(true);
                props.onFocus?.(e);
            }}
            onBlur={(e) => {
                setIsFocused(false);
                props.onBlur?.(e);
            }}
            style={[
                styles.base,
                props.style,
                {
                    borderWidth,
                    // TODO: i should be able to disable default border
                    borderColor: shouldAnimateBorder ? animatedBorderColor : undefined,
                },
            ]}
        />
    );
}

export const SafeAreaView = styled(_SafeAreaView);
export const View = styled(_View);
export const Text = styled(_UnstyledText);
export const InputField = styled(UnstyledTextInput);
export const ScrollView = styled(_ScrollView);
export const LinearGradient = styled(_LinearGradient);
export const TouchableOpacity = styled(_TouchableOpacity);
export const BottomSheetModal = styled(_BottomSheetModal);
export const Image = styled(_Image);

const styles = StyleSheet.create({
    base: {
        borderWidth: 1,
        borderColor: '#e9d5ff',
        padding: 8,
        borderRadius: 4,
    },
});
