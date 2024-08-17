import { View } from '@/components/Shared/styled';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { TextInput, Animated } from 'react-native';
import tw from 'twrnc';

interface OTPInputProps {
    codes: string[];
    refs: RefObject<TextInput>[];
    errorMessages: string[] | undefined;
    onChangeCode: (text: string, index: number) => void;
    onComplete: (otp: string) => void;
}

export function OTPInput({ codes, refs, errorMessages, onChangeCode, onComplete }: OTPInputProps) {
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const borderColorAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(borderColorAnim, {
            toValue: focusedIndex,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [focusedIndex]);

    const handleChangeText = (text: string, index: number) => {
        const newCodes = [...codes];
        newCodes[index] = text;
        onChangeCode(text, index);

        // Check if all inputs are filled
        if (newCodes.every((code) => code !== '')) {
            onComplete(newCodes.join(''));
        }

        // Move to the next input field if the current field is filled
        if (text && index < refs.length - 1) {
            refs[index + 1]?.current?.focus();
        }
    };

    const interpolateBorderColor = (index: number) => {
        return borderColorAnim.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: ['#D8B4FE', '#8B5CF6', '#D8B4FE'],
            extrapolate: 'clamp',
        });
    };

    return (
        <View className='flex w-full flex-row justify-between'>
            {codes.map((code, index) => (
                <Animated.View
                    key={index}
                    style={{
                        borderColor: interpolateBorderColor(index),
                        borderWidth: 2,
                        borderRadius: 8,
                    }}
                >
                    <TextInput
                        onFocus={() => setFocusedIndex(index)}
                        autoComplete='one-time-code'
                        enterKeyHint='next'
                        style={{
                            fontFamily: 'Suprapower',
                            ...tw`bg-purple-50 text-center rounded-lg px-2 py-1 w-[48px] h-[48px]`,
                        }}
                        inputMode='numeric'
                        onChangeText={(text) => handleChangeText(text, index)}
                        value={code}
                        maxLength={index === 0 ? codes.length : 1}
                        ref={refs[index]}
                        onKeyPress={({ nativeEvent: { key } }) => {
                            if (key === 'Backspace' && index > 0 && !codes[index]) {
                                refs[index - 1]?.current?.focus();
                                onChangeCode('', index - 1);
                            }
                        }}
                    />
                </Animated.View>
            ))}
        </View>
    );
}
