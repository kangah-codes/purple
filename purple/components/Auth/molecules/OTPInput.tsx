import { View, InputField } from '@/components/Shared/styled';
import type { RefObject } from 'react';
import { TextInput } from 'react-native';
import tw from 'twrnc';

interface OTPInputProps {
    codes: string[];
    refs: RefObject<TextInput>[];
    errorMessages: string[] | undefined;
    onChangeCode: (text: string, index: number) => void;
    onComplete: (otp: string) => void;
}

export function OTPInput({ codes, refs, errorMessages, onChangeCode, onComplete }: OTPInputProps) {
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
    return (
        <View className='flex w-full flex-row justify-between'>
            {codes.map((code, index) => (
                <TextInput
                    key={index}
                    autoComplete='one-time-code'
                    enterKeyHint='next'
                    style={{
                        fontFamily: 'Suprapower',
                        ...tw`bg-purple-50 text-center rounded-lg px-2 py-1 w-[48px] h-[48px] border-2 border-purple-200 focus:border-purple-500`,
                    }}
                    inputMode='numeric'
                    onChangeText={(text: string) => handleChangeText(text, index)}
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
            ))}
        </View>
    );
}
