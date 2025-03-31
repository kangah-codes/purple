import AsyncInput from '@/components/Shared/atoms/Input/AsyncInput';
import ProtectedInput from '@/components/Shared/atoms/Input/ProtectedInput';
import {
    InputField,
    LinearGradient,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { useDebounce } from '@/lib/utils/debounce';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar as RNStatusBar,
    StyleSheet,
    TouchableWithoutFeedback,
} from 'react-native';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';
import { useCheckUsername, useSignUp } from '../hooks';
import { SignUpResponse, SignUpScreenData } from '../schema';
import { nativeStorage } from '@/lib/utils/storage';
import { GenericAPIResponse } from '@/@types/request';

export default function SignUpScreen() {
    const [usernameLoading, setUsernameLoading] = useState(false);
    const [usernameTaken, setUsernameTaken] = useState(false);
    const [loading, setLoading] = useState(false);
    const {
        control,
        handleSubmit,
        formState: { errors },
        setError,
        clearErrors,
        getValues,
    } = useForm<SignUpScreenData>({
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
            username: '',
        },
    });
    const { mutate, isLoading } = useCheckUsername();
    const { mutate: signUpMutate, isLoading: signUpLoading } = useSignUp();
    const checkUsername = (loginInformation: { username: string }) => {
        mutate(loginInformation, {
            onSuccess: (res) => {
                // delete error if username is available
                setUsernameTaken(false);
                clearErrors('username');
            },
            onError: () => {
                setUsernameTaken(true);
                setError('username', {
                    type: 'manual',
                    message: 'Username is taken',
                });
            },
            onSettled: () => {
                setUsernameLoading(false);
            },
        });
    };

    const signUp = (data: SignUpScreenData) => {
        Keyboard.dismiss();
        setLoading(true);
        signUpMutate(
            {
                username: data.username.trim(),
                email: data.email.trim(),
                password: data.password.trim(),
            },
            {
                onSuccess: (res) => {
                    Toast.show({
                        type: 'success',
                        props: {
                            text1: 'Welcome!',
                            text2: 'Your Purple account has been created successfully!',
                        },
                    });
                    nativeStorage.setItem('onboardingUsername', res.data.username);
                    router.push('/auth/activate');
                },
                onError: (error) => {
                    Toast.show({
                        type: 'error',
                        props: {
                            text1: 'Something went wrong!',
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

    const debouncedCheckUsername = useDebounce((username: string) => {
        setUsernameLoading(true);
        checkUsername({ username });
    }, 300);

    return (
        <SafeAreaView style={[stylesheet.safeAreaView, tw`bg-white flex-1`]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={tw`flex-1`}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={tw`flex-1 px-5`}>
                        <ExpoStatusBar style='dark' />

                        {/* Header */}
                        <View style={tw`mt-5 mb-5`}>
                            <Text
                                style={[
                                    GLOBAL_STYLESHEET.satoshiBlack,
                                    tw`text-2xl text-black text-center`,
                                ]}
                            >
                                Create your account
                            </Text>
                            <Text
                                style={[
                                    GLOBAL_STYLESHEET.satoshiMedium,
                                    tw`text-sm text-gray-600 text-center mt-2.5`,
                                ]}
                            >
                                You made the right choice! Let's get you started.
                            </Text>
                        </View>

                        {/* TabView */}
                        <View style={tw`flex-1`}>
                            <View className='space-y-3.5 flex flex-col w-full'>
                                <View className='flex flex-col space-y-1'>
                                    <Text
                                        style={GLOBAL_STYLESHEET.satoshiBold}
                                        className='text-xs text-gray-600'
                                    >
                                        Username
                                    </Text>
                                    <Controller
                                        control={control}
                                        rules={{
                                            required: "Username can't be empty",
                                        }}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <AsyncInput
                                                // @ts-ignore
                                                className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                                style={GLOBAL_STYLESHEET.satoshiMedium}
                                                cursorColor={'#8B5CF6'}
                                                placeholder='Username'
                                                onChangeText={(data) => {
                                                    onChange(data);
                                                    debouncedCheckUsername(data);
                                                }}
                                                onBlur={onBlur}
                                                value={value}
                                                autoCapitalize='none'
                                                isLoading={usernameLoading}
                                            />
                                        )}
                                        name='username'
                                    />
                                    {errors.username && (
                                        <Text
                                            style={GLOBAL_STYLESHEET.satoshiMedium}
                                            className='text-xs text-red-500'
                                        >
                                            {errors.username.message}
                                        </Text>
                                    )}
                                </View>
                                <View className='flex flex-col space-y-1'>
                                    <Text
                                        style={GLOBAL_STYLESHEET.satoshiBold}
                                        className='text-xs text-gray-600'
                                    >
                                        Email Address
                                    </Text>
                                    <Controller
                                        control={control}
                                        rules={{
                                            required: "Email can't be empty",
                                            // I know, regex for email validation is a sin :)
                                            pattern: {
                                                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i,
                                                message: 'Invalid email address',
                                            },
                                        }}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <InputField
                                                className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                                style={GLOBAL_STYLESHEET.satoshiMedium}
                                                cursorColor={'#8B5CF6'}
                                                placeholder='Email'
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                autoCapitalize='none'
                                            />
                                        )}
                                        name='email'
                                    />
                                    {errors.email && (
                                        <Text
                                            style={GLOBAL_STYLESHEET.satoshiMedium}
                                            className='text-xs text-red-500'
                                        >
                                            {errors.email.message}
                                        </Text>
                                    )}
                                </View>
                                <View className='flex flex-col space-y-1'>
                                    <Text
                                        style={GLOBAL_STYLESHEET.satoshiBold}
                                        className='text-xs text-gray-600'
                                    >
                                        Password
                                    </Text>
                                    <Controller
                                        control={control}
                                        rules={{
                                            required: "Password can't be empty",
                                            minLength: {
                                                value: 8,
                                                message:
                                                    'Password must be at least 8 characters long',
                                            },
                                        }}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <ProtectedInput
                                                className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                                style={GLOBAL_STYLESHEET.satoshiMedium}
                                                cursorColor={'#8B5CF6'}
                                                placeholder='Password'
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                autoCapitalize='none'
                                            />
                                        )}
                                        name='password'
                                    />
                                    {errors.password && (
                                        <Text
                                            style={GLOBAL_STYLESHEET.satoshiMedium}
                                            className='text-xs text-red-500'
                                        >
                                            {errors.password.message}
                                        </Text>
                                    )}
                                </View>
                                <View className='flex flex-col space-y-1'>
                                    <Text
                                        style={GLOBAL_STYLESHEET.satoshiBold}
                                        className='text-xs text-gray-600'
                                    >
                                        Confirm Password
                                    </Text>
                                    <Controller
                                        control={control}
                                        rules={{
                                            required: "Confirmation password can't be empty",
                                            validate: (value) =>
                                                value === getValues('password') ||
                                                'Passwords do not match',
                                        }}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <ProtectedInput
                                                className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                                style={GLOBAL_STYLESHEET.satoshiMedium}
                                                cursorColor={'#8B5CF6'}
                                                placeholder='Confirm Password'
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                autoCapitalize='none'
                                            />
                                        )}
                                        name='confirmPassword'
                                    />
                                    {errors.password && (
                                        <Text
                                            style={GLOBAL_STYLESHEET.satoshiMedium}
                                            className='text-xs text-red-500'
                                        >
                                            {errors.password.message}
                                        </Text>
                                    )}
                                </View>
                                <View className='flex flex-row justify-between'>
                                    <TouchableOpacity
                                        onPress={() => router.replace('/auth/sign-in')}
                                    >
                                        <Text
                                            style={GLOBAL_STYLESHEET.satoshiBold}
                                            className='text-xs text-purple-500'
                                        >
                                            Already a user? Sign in
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => router.replace('/auth/activate')}
                                    >
                                        <Text
                                            style={GLOBAL_STYLESHEET.satoshiBold}
                                            className='text-xs text-purple-500'
                                        >
                                            Activate account
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Sign Up Button */}
                        <View style={tw`mb-5 mt-2.5`}>
                            <TouchableOpacity
                                style={{
                                    ...tw`w-full`,
                                    ...(usernameLoading ? tw`opacity-50` : {}),
                                }}
                                onPress={handleSubmit(signUp)}
                                disabled={loading || usernameLoading}
                            >
                                <LinearGradient
                                    style={tw`flex items-center justify-center rounded-full px-5 py-2.5 h-12`}
                                    colors={['#c084fc', '#9333ea']}
                                >
                                    {loading ? (
                                        <ActivityIndicator size={18} color='#fff' />
                                    ) : (
                                        <Text
                                            style={[
                                                GLOBAL_STYLESHEET.satoshiBlack,
                                                tw`text-base text-white`,
                                            ]}
                                        >
                                            Let's Go
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const stylesheet = StyleSheet.create({
    safeAreaView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
