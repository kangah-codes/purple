import { ExternalLink } from '@/components/Shared/molecules/ExternalLink';
import {
    InputField,
    Text,
    View,
    SafeAreaView,
    LinearGradient,
    TouchableOpacity,
} from '@/components/Shared/styled';
import { Controller, useForm } from 'react-hook-form';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    TouchableWithoutFeedback,
} from 'react-native';
import tw from 'twrnc';
import { ActivityIndicator, StatusBar as RNStatusBar } from 'react-native';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import useHasOnboarded from '@/lib/db/db';
import { OTPInput } from '../molecules/OTPInput';

export default function OTPScreen() {
    const [loading, setLoading] = useState(false);
    const { setHasOnboarded } = useHasOnboarded();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            fullName: '',
            userName: '',
            email: '',
        },
    });

    const onSubmit = handleSubmit((data) => {
        console.log(data);
    });

    const [codes, setCodes] = useState<string[]>(['', '', '', '', '', '']);
    const inputRefs = Array.from({ length: codes.length }, () => useRef<TextInput>(null));

    const handleChangeCode = (text: string, index: number) => {
        const newCodes = [...codes];
        newCodes[index] = text;
        setCodes(newCodes);

        // Move to the next input field if the current field is filled
        if (text && index < codes.length - 1) {
            inputRefs[index + 1]?.current?.focus();
        }
    };

    return (
        <SafeAreaView
            style={{
                paddingTop: RNStatusBar.currentHeight,
            }}
            className='bg-white'
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={tw`w-full flex flex-row h-full`}
                >
                    <View className='bg-white relative h-full flex flex-col items-stretch px-5'>
                        <ExpoStatusBar style='dark' />
                        <View className='w-full space-y- flex flex-col items-center justify-center flex-grow'>
                            <View className='flex flex-col space-y-2.5'>
                                <Text
                                    style={{ fontFamily: 'Suprapower' }}
                                    className='text-2xl text-black text-center'
                                >
                                    Enter your one-time password
                                </Text>
                                <Text
                                    style={{ fontFamily: 'InterMedium' }}
                                    className='text-sm textblack text-center'
                                >
                                    Enter the 6-digit pin sent to your email at a*****9@*****.com
                                </Text>
                            </View>

                            <View className='mt-5'>
                                <OTPInput
                                    codes={codes}
                                    refs={inputRefs}
                                    errorMessages={undefined}
                                    onChangeCode={handleChangeCode}
                                    onComplete={alert}
                                />
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}
