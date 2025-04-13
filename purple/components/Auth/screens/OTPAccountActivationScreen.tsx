import {
    InputField,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    LinearGradient,
} from '@/components/Shared/styled';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StatusBar as RNStatusBar,
    TextInput,
    TouchableWithoutFeedback,
} from 'react-native';
import tw from 'twrnc';
import { OTPInput } from '../molecules/OTPInput';
import { Controller, useForm } from 'react-hook-form';
import {} from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeftIcon } from '@/components/SVG/24x24';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import React from 'react';
import { nativeStorage } from '@/lib/utils/storage';
import { useActivateAccount } from '../hooks';
import Toast from 'react-native-toast-message';

export default function OTPAccountActivationScreen() {
    const [codes, setCodes] = useState<string[]>(['', '', '', '', '']);
    const inputRefs = Array.from({ length: codes.length }, () => useRef<TextInput>(null));
    const [loading, setLoading] = useState(false);
    const { mutate: activateMutate, isLoading: activateLoading } = useActivateAccount();
    const handleChangeCode = (text: string, index: number) => {
        setCodes((prevCodes) => {
            const newCodes = [...prevCodes];
            newCodes[index] = text;

            // if all fields are filled, trigger completion
            if (newCodes.every((code) => code !== '')) {
                // TODO: have to do this because fuck async state update
                // too lazy to rewrite the code now
                activateAccount(newCodes.join(''));
            }

            return newCodes;
        });

        // Move to the next input field if the current field is filled
        if (text && index < codes.length - 1) {
            inputRefs[index + 1]?.current?.focus();
        }
    };

    const activateAccount = (otp: string) => {
        Keyboard.dismiss();
        setLoading(true);
        activateMutate(
            {
                username: nativeStorage.getItem('onboardingUsername'),
                verification_code: otp,
            },
            {
                onSuccess: (res) => {
                    Toast.show({
                        type: 'success',
                        props: {
                            text1: 'Welcome!',
                            text2: 'Your Purple account has been activated successfully!',
                        },
                    });
                    nativeStorage.removeItem('onboardingUsername');
                    router.push('/auth/sign-in');
                },
                onError: (error) => {
                    Toast.show({
                        type: 'error',
                        props: {
                            text1: "Couldn't activate your account",
                            text2: error.message,
                        },
                    });
                },
                onSettled: () => {
                    setLoading(false);
                },
            },
        );
    };

    return (
        <SafeAreaView
            style={{
                paddingTop: RNStatusBar.currentHeight,
            }}
            className='bg-white'
        >
            <ExpoStatusBar style='dark' />
            <View className='w-full flex flex-row px-5 py-2.5 justify-between items-center'>
                {/** TODO: replace with router.back */}
                <TouchableOpacity onPress={() => router.replace('/auth/sign-up')}>
                    <View className='flex flex-row space-x-2 items-center justify-center'>
                        <ChevronLeftIcon strokeWidth={3} width={17} stroke='#9333ea' />
                        <Text
                            style={GLOBAL_STYLESHEET.satoshiBold}
                            className='text-purple-600 text-sm'
                        >
                            Back
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
            {activateLoading && (
                <Modal transparent={true} animationType='fade' visible={activateLoading}>
                    <View className='flex-1 bg-white opacity-80 items-center justify-center'>
                        <ActivityIndicator size='large' color='#8e51ff' />
                    </View>
                </Modal>
            )}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={tw`w-full flex flex-row h-full`}
                >
                    <View className='bg-white w-full relative flex flex-col items-stretch px-5'>
                        <ExpoStatusBar style='dark' />
                        <View className='w-full space-y-5 flex flex-col items-center justify-center'>
                            <View className='flex flex-col space-y-2.5'>
                                <Text
                                    style={[
                                        GLOBAL_STYLESHEET.satoshiBlack,
                                        tw`text-2xl text-black text-center`,
                                    ]}
                                    className='text-2xl text-black text-center'
                                >
                                    Activate your Account
                                </Text>
                                <Text
                                    style={GLOBAL_STYLESHEET.satoshiMedium}
                                    className='text-sm text-gray-600 text-center'
                                >
                                    Enter the 5-digit activation code you received in your email
                                </Text>
                            </View>

                            <View className='w-full'>
                                <View className='mt-5 w-full space-y-5 flex flex-col items-center justify-center flex-grow'>
                                    <OTPInput
                                        codes={codes}
                                        refs={inputRefs}
                                        errorMessages={undefined}
                                        inputType='text'
                                        onChangeCode={handleChangeCode}
                                        onComplete={() => {}}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}
