import { ExternalLink } from '@/components/Shared/molecules/ExternalLink';
import { InputField, Text, View } from '@/components/Shared/styled';
import { Controller, useForm } from 'react-hook-form';
import { forwardRef, useImperativeHandle } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import tw from 'twrnc';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';

const PersonalInformation = forwardRef((props, ref) => {
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

    useImperativeHandle(ref, () => ({
        submit: onSubmit,
    }));

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={tw`w-full`}
        >
            <View className='space-y-3.5 flex flex-col w-full px-5'>
                <View className='flex flex-col space-y-1'>
                    <Text style={{ fontFamily: 'InterBold' }} className='text-xs text-gray-600'>
                        Full name
                    </Text>

                    <Controller
                        control={control}
                        rules={{
                            required: "Full name can't be empty",
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <InputField
                                className='bg-gray-100 rounded-lg px-4 text-xs border border-gray-200 h-12 text-gray-900'
                                style={GLOBAL_STYLESHEET.interSemiBold}
                                cursorColor={'#8B5CF6'}
                                placeholder='John Doe'
                                onChangeText={onChange}
                                onBlur={onBlur}
                                value={value}
                            />
                        )}
                        name='fullName'
                    />
                    {errors.fullName && (
                        <Text
                            style={{ fontFamily: 'InterMedium' }}
                            className='text-xs text-red-500'
                        >
                            {errors.fullName.message}
                        </Text>
                    )}
                </View>

                <View className='flex flex-col space-y-1'>
                    <Text style={{ fontFamily: 'InterBold' }} className='text-xs text-gray-600'>
                        Username
                    </Text>

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
                                className='bg-gray-100 rounded-lg px-4 text-xs border border-gray-200 h-12 text-gray-900'
                                style={GLOBAL_STYLESHEET.interSemiBold}
                                cursorColor={'#8B5CF6'}
                                placeholder='John Doe'
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
                    <Text style={{ fontFamily: 'InterBold' }} className='text-xs text-gray-600'>
                        Email
                    </Text>

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
                                className='bg-gray-100 rounded-lg px-4 text-xs border border-gray-200 h-12 text-gray-900'
                                style={GLOBAL_STYLESHEET.interSemiBold}
                                cursorColor={'#8B5CF6'}
                                placeholder='hello@purpleapp.com'
                                onChangeText={onChange}
                                onBlur={onBlur}
                                value={value}
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

                <Text style={{ fontFamily: 'InterBold' }} className='text-xs text-gray-600'>
                    Signing up means you agree to our{' '}
                    <ExternalLink href='https://purpleapp.vercel.app'>
                        <Text className='text-purple-500'>Terms and Conditions</Text>
                    </ExternalLink>
                    .
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
});

export default PersonalInformation;
