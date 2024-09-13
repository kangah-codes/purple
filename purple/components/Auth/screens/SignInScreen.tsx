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
import { Image } from 'expo-image';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar as RNStatusBar,
    TouchableWithoutFeedback,
} from 'react-native';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';
import { useAuth, useSignIn } from '../hooks';

export default function SignInScreen() {
    const [loading, setLoading] = useState(false);
    const { setSessionData } = useAuth();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            username: '',
            password: '',
        },
    });
    const { mutate, isLoading, error, data } = useSignIn();
    const signUp = (loginInformation: { username: string; password: string }) => {
        Keyboard.dismiss();
        console.log(isLoading);
        mutate(loginInformation, {
            onError: () => {
                Toast.show({
                    type: 'error',
                    props: {
                        text1: 'Error!',
                        text2: 'Invalid username/password',
                    },
                });
            },
            onSuccess: (res) => {
                const { data } = res;
                console.log(data, 'RESPONSE FROM LOGIN');
                setSessionData(data)
                    .then(() => {
                        router.push('/(tabs)');
                    })
                    .catch(() => {
                        Toast.show({
                            type: 'error',
                            props: {
                                text1: 'Error!',
                                text2: "Couldn't sign you in. Try again later",
                            },
                        });
                    });
                console.log(data);
                // setHasOnboarded(true).then(() => router.push('/'));
            },
        });
        console.log(isLoading, error, data, loginInformation);
    };

    return (
        <SafeAreaView
            style={{
                paddingTop: RNStatusBar.currentHeight,
            }}
            className='bg-white'
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className='bg-white relative h-full flex flex-col items-stretch px-5'>
                    <ExpoStatusBar style='dark' />
                    <View className='w-full space-y-5 flex flex-col items-center justify-center flex-grow'>
                        <View className=''>
                            <Image
                                source={require('@/assets/images/graphics/1.png')}
                                style={tw`h-22 w-52`}
                            />
                        </View>
                        <View className='flex flex-col space-y-2.5'>
                            <Text
                                style={{ fontFamily: 'Suprapower' }}
                                className='text-2xl text-black text-center'
                            >
                                Welcome back!
                            </Text>
                            <Text
                                style={{ fontFamily: 'InterMedium' }}
                                className='text-sm textblack text-center'
                            >
                                Enjoy a seamless experience with Purple and take control of your
                                finances today!
                            </Text>
                        </View>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={tw`w-full`}
                        >
                            <View className='space-y-3.5 flex flex-col w-full'>
                                <View className='flex flex-col space-y-1'>
                                    <Text
                                        style={{ fontFamily: 'InterBold' }}
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
                                            <InputField
                                                className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                                style={GLOBAL_STYLESHEET.interSemiBold}
                                                cursorColor={'#8B5CF6'}
                                                placeholder='gyimihendrix'
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                autoCapitalize='none'
                                            />
                                        )}
                                        name='username'
                                    />
                                    {errors.username && (
                                        <Text
                                            style={{ fontFamily: 'InterMedium' }}
                                            className='text-xs text-red-500'
                                        >
                                            {errors.username.message}
                                        </Text>
                                    )}
                                </View>

                                <View className='flex flex-col space-y-1'>
                                    <Text
                                        style={{ fontFamily: 'InterBold' }}
                                        className='text-xs text-gray-600'
                                    >
                                        Password
                                    </Text>

                                    <Controller
                                        control={control}
                                        rules={{
                                            required: "Password can't be empty",
                                        }}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <ProtectedInput
                                                className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                                style={GLOBAL_STYLESHEET.interSemiBold}
                                                cursorColor={'#8B5CF6'}
                                                placeholder='password'
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                            />
                                        )}
                                        name='password'
                                    />
                                    {errors.password && (
                                        <Text
                                            style={{ fontFamily: 'InterMedium' }}
                                            className='text-xs text-red-500'
                                        >
                                            {errors.password.message}
                                        </Text>
                                    )}
                                </View>

                                <TouchableOpacity className='w-full' onPress={handleSubmit(signUp)}>
                                    <LinearGradient
                                        className='flex items-center justify-center rounded-full px-5 py-2.5 h-12'
                                        colors={['#c084fc', '#9333ea']}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator size={18} color='#fff' />
                                        ) : (
                                            <Text
                                                style={{ fontFamily: 'InterBold' }}
                                                className='text-base text-white tracking-tight'
                                            >
                                                Sign In
                                            </Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View className='flex flex-row justify-between'>
                                    <TouchableOpacity onPress={() => router.push('/auth/otp')}>
                                        <Text
                                            style={{ fontFamily: 'InterBold' }}
                                            className='text-xs text-purple-500'
                                        >
                                            Forgot your password?
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => router.replace('/auth/sign-up')}
                                    >
                                        <Text
                                            style={{ fontFamily: 'InterBold' }}
                                            className='text-xs text-purple-500'
                                        >
                                            New here? Sign Up
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}
