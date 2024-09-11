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
import tw from 'twrnc';
import { useAuth } from '../hooks';

export default function SignUpScreen() {
    const [loading, setLoading] = useState(false);
    const { setOnboarded } = useAuth();
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
                                source={require('@/assets/images/graphics/2.png')}
                                style={tw`h-22 w-52`}
                            />
                        </View>
                        <View className='flex flex-col space-y-2.5'>
                            <Text
                                style={{ fontFamily: 'Suprapower' }}
                                className='text-2xl text-black text-center'
                            >
                                Hand over your details
                            </Text>
                            <Text
                                style={{ fontFamily: 'InterMedium' }}
                                className='text-sm text-gray-600 text-center'
                            >
                                You made the right choice! Let's get you started.
                            </Text>
                        </View>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={tw`w-full`}
                        >
                            <View className='space-y-3.5 flex flex-col w-full'>
                                <View className='flex flex-col space-y-1'>
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
                                                style={GLOBAL_STYLESHEET.interSemiBold}
                                                cursorColor={'#8B5CF6'}
                                                placeholder='First Name'
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
                                                style={GLOBAL_STYLESHEET.interSemiBold}
                                                cursorColor={'#8B5CF6'}
                                                placeholder='Username'
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
                                                style={GLOBAL_STYLESHEET.interSemiBold}
                                                cursorColor={'#8B5CF6'}
                                                placeholder='Phone'
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
                                                style={GLOBAL_STYLESHEET.interSemiBold}
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
                                        setOnboarded(true)
                                            .then(() => {
                                                router.push('/(tabs)/');
                                            })
                                            .finally(() => {
                                                setLoading(false);
                                            });
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
                                                Get Started
                                            </Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View className='flex flex-row justify-between'>
                                    <TouchableOpacity
                                        onPress={() => router.replace('/auth/sign-in')}
                                    >
                                        <Text
                                            style={{ fontFamily: 'InterBold' }}
                                            className='text-xs text-purple-500'
                                        >
                                            Already a user? Sign in
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
