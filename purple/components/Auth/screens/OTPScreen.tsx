import {
    InputField,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    LinearGradient,
} from '@/components/Shared/styled';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
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
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';

export default function OTPScreen() {
    const [codes, setCodes] = useState<string[]>(['', '', '', '', '', '']);
    const inputRefs = Array.from({ length: codes.length }, () => useRef<TextInput>(null));
    const [loading, setLoading] = useState(false);
    const [hasRequestedCode, setHasRequestedCode] = useState(false);
    const [canResetPassword, setCanResetPassword] = useState(false);

    const handleChangeCode = (text: string, index: number) => {
        const newCodes = [...codes];
        newCodes[index] = text;
        setCodes(newCodes);

        // Move to the next input field if the current field is filled
        if (text && index < codes.length - 1) {
            inputRefs[index + 1]?.current?.focus();
        }
    };

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

    return (
        <SafeAreaView
            style={{
                paddingTop: RNStatusBar.currentHeight,
            }}
            className='bg-white'
        >
            <ExpoStatusBar style='dark' />
            <View className='w-full flex flex-row px-5 py-2.5 justify-between items-center'>
                <TouchableOpacity onPress={router.back}>
                    <View className='flex flex-row space-x-2 items-center'>
                        <ChevronLeftIcon strokeWidth={3} width={17} stroke='#9333ea' />
                        <Text style={GLOBAL_STYLESHEET.interSemiBold} className='text-purple-600'>
                            Back
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={tw`w-full flex flex-row h-full`}
                >
                    <View className='bg-white relative h-full flex flex-col items-stretch px-5'>
                        <ExpoStatusBar style='dark' />
                        <View className='w-full space-y-5 flex flex-col items-center justify-center flex-grow'>
                            <View className='flex flex-col space-y-2.5'>
                                <Text
                                    style={{ fontFamily: 'Suprapower' }}
                                    className='text-2xl text-black text-center'
                                >
                                    Forgot password?
                                </Text>
                                <Text
                                    style={{ fontFamily: 'InterMedium' }}
                                    className='text-sm text-gray-600 text-center'
                                >
                                    {hasRequestedCode
                                        ? 'Enter the 6-digit code sent to your email address'
                                        : `Enter your email address and we'll send you a 6-digit code to reset your password`}
                                </Text>
                            </View>

                            <View className='w-full'>
                                {hasRequestedCode ? (
                                    <View className='mt-5 w-full space-y-5 flex flex-col items-center justify-center flex-grow'>
                                        <OTPInput
                                            codes={codes}
                                            refs={inputRefs}
                                            errorMessages={undefined}
                                            onChangeCode={handleChangeCode}
                                            onComplete={() => {
                                                router.replace('/auth/sign-in');
                                            }}
                                        />
                                    </View>
                                ) : (
                                    <View className='w-full space-y-5 flex flex-col items-center justify-center flex-grow'>
                                        <View className='flex flex-col space-y-1 w-full'>
                                            <Controller
                                                control={control}
                                                rules={{
                                                    required: "Username can't be empty",
                                                    pattern: {
                                                        value: /^[a-zA-Z0-9]{1,10}$/,
                                                        message: 'Invalid username',
                                                    },
                                                }}
                                                render={({
                                                    field: { onChange, onBlur, value },
                                                }) => (
                                                    <InputField
                                                        className='bg-gray-100 rounded-full px-4 text-xs border border-gray-200 h-12 text-gray-900'
                                                        style={GLOBAL_STYLESHEET.interSemiBold}
                                                        cursorColor={'#8B5CF6'}
                                                        placeholder='Email address'
                                                        onChangeText={onChange}
                                                        onBlur={onBlur}
                                                        value={value}
                                                        autoCapitalize='none'
                                                    />
                                                )}
                                                name='userName'
                                            />
                                            {errors.userName && (
                                                <Text
                                                    style={{ fontFamily: 'InterMedium' }}
                                                    className='text-xs text-red-500'
                                                >
                                                    {errors.userName.message}
                                                </Text>
                                            )}
                                        </View>

                                        <TouchableOpacity
                                            className='w-full'
                                            onPress={() => {
                                                setLoading(true);
                                                setTimeout(() => {
                                                    setLoading(false);
                                                    setHasRequestedCode(true);
                                                }, 3000);
                                            }}
                                        >
                                            <LinearGradient
                                                className='flex items-center justify-center rounded-full px-5 py-2.5 h-12'
                                                colors={['#c084fc', '#9333ea']}
                                            >
                                                {loading ? (
                                                    <ActivityIndicator size={18} color='#fff' />
                                                ) : (
                                                    <Text
                                                        style={{ fontFamily: 'InterBold' }}
                                                        className='text-base text-white tracking-tight'
                                                    >
                                                        Send Code
                                                    </Text>
                                                )}
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}
