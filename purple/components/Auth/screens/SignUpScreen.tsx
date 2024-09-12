import {
    InputField,
    LinearGradient,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
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
    StyleSheet,
    TouchableWithoutFeedback,
} from 'react-native';
import tw from 'twrnc';
import { useAuth } from '../hooks';
import { SignUpScreenData } from '../schema';
import ProtectedInput from '@/components/Shared/atoms/Input/ProtectedInput';

export default function SignUpScreen() {
    const [loading, setLoading] = useState(false);
    const [index, _setIndex] = useState(0);
    const { setOnboarded } = useAuth();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpScreenData>({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            userName: '',
        },
    });

    const setIndex = (index: number) => {
        _setIndex(index);
    };

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
                                    GLOBAL_STYLESHEET.suprapower,
                                    tw`text-2xl text-black text-center`,
                                ]}
                            >
                                Create your account
                            </Text>
                            <Text
                                style={[
                                    { fontFamily: 'InterMedium' },
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
                                                className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
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
                                                className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                                style={GLOBAL_STYLESHEET.interSemiBold}
                                                cursorColor={'#8B5CF6'}
                                                placeholder='Email'
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
                                            <ProtectedInput
                                                className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                                style={GLOBAL_STYLESHEET.interSemiBold}
                                                cursorColor={'#8B5CF6'}
                                                placeholder='Password'
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
                                            <ProtectedInput
                                                className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                                style={GLOBAL_STYLESHEET.interSemiBold}
                                                cursorColor={'#8B5CF6'}
                                                placeholder='Confirm Password'
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
                        </View>

                        {/* Sign Up Button */}
                        <View style={tw`mb-5 mt-2.5`}>
                            <TouchableOpacity
                                style={tw`w-full`}
                                onPress={() => {
                                    if (index == 0) {
                                        setIndex(1);
                                        return;
                                    }
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
                                    style={tw`flex items-center justify-center rounded-full px-5 py-2.5 h-12`}
                                    colors={['#c084fc', '#9333ea']}
                                >
                                    {loading ? (
                                        <ActivityIndicator size={18} color='#fff' />
                                    ) : (
                                        <Text
                                            style={[
                                                { fontFamily: 'InterBold' },
                                                tw`text-base text-white tracking-tight`,
                                            ]}
                                        >
                                            {index == 0 ? 'Next' : 'Get Started'}
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
