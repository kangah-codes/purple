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
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import tw from 'twrnc';
import { ActivityIndicator, StatusBar as RNStatusBar } from 'react-native';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import useHasOnboarded from '@/lib/db/db';

export default function SignInScreen() {
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
                                    {/* <Text
                                    style={{ fontFamily: 'InterBold' }}
                                    className='text-xs text-gray-500'
                                >
                                    Username
                                </Text> */}

                                    <Controller
                                        control={control}
                                        rules={{
                                            required: "Username can't be empty",
                                            pattern: {
                                                value: /^[a-zA-Z0-9]{1,10}$/,
                                                message: 'Invalid username',
                                            },
                                        }}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <InputField
                                                className='bg-gray-100 rounded-full px-4 text-xs border border-gray-200 h-12 text-gray-900'
                                                style={{ fontFamily: 'InterSemiBold' }}
                                                cursorColor={'#8B5CF6'}
                                                placeholder='gyimihendrix'
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

                                <View className='flex flex-col space-y-1'>
                                    {/* <Text
                                    style={{ fontFamily: 'InterBold' }}
                                    className='text-xs text-gray-500'
                                >
                                    Email
                                </Text> */}

                                    <Controller
                                        control={control}
                                        rules={{
                                            required: "Email can't be empty",
                                            pattern: {
                                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                                message: 'Invalid email address',
                                            },
                                        }}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <InputField
                                                className='bg-gray-100 rounded-full px-4 text-xs border border-gray-200 h-12 text-gray-900'
                                                style={{ fontFamily: 'InterSemiBold' }}
                                                cursorColor={'#8B5CF6'}
                                                placeholder='hello@purpleapp.com'
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                value={value}
                                                secureTextEntry
                                            />
                                        )}
                                        name='email'
                                    />
                                    {errors.email && (
                                        <Text
                                            style={{ fontFamily: 'InterMedium' }}
                                            className='text-xs text-red-500'
                                        >
                                            {errors.email.message}
                                        </Text>
                                    )}
                                </View>

                                <TouchableOpacity
                                    className='w-full'
                                    onPress={() => {
                                        setLoading(true);
                                        setHasOnboarded(true)
                                            .then(() => {
                                                router.push('/(tabs)/');
                                            })
                                            .finally(() => {
                                                setLoading(false);
                                            });
                                    }}
                                >
                                    <LinearGradient
                                        className='flex items-center justify-center rounded-full px-5 py-2.5'
                                        colors={['#c084fc', '#9333ea']}
                                    >
                                        {loading ? (
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

                                <Text
                                    style={{ fontFamily: 'InterBold' }}
                                    className='text-xs text-purple-500'
                                >
                                    Forgot your password?
                                </Text>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}