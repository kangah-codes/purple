import { ArrowLeftIcon } from '@/components/SVG/icons/24x24';
import { useCreateCategory, usePreferences } from '@/components/Settings/hooks';
import { useStartupGuide } from '@/components/Settings/hooks/useStartupGuide';
import {
    InputField,
    LinearGradient,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { isEmoji } from '@/lib/utils/string';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Keyboard, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

export default function NewCategoryScreen() {
    const { addCategory } = usePreferences();
    const { markStepCompleted } = useStartupGuide();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            category: '',
            emoji: '',
        },
    });
    const { mutate, isLoading } = useCreateCategory();
    const { logEvent } = useAnalytics();

    const onSubmit = async (data: { emoji: string; category: string }) => {
        await logEvent('object_created', {
            payload: data,
            object_type: 'transaction_category',
        });
        Keyboard.dismiss();
        mutate(data, {
            onError: async () => {
                await logEvent('error_occurred', {
                    error_type: 'OBJECT_CREATE_ERROR',
                    context: `Failed to create transaction category`,
                    severity: 'medium',
                });
                Toast.show({
                    type: 'error',
                    props: { text1: 'Error!', text2: 'Error creating category' },
                });
            },
            onSuccess: () => {
                addCategory({ ...data, is_custom: 1 });
                markStepCompleted('customize_categories');
                Toast.show({
                    type: 'success',
                    props: { text1: 'Success!', text2: 'Category created successfully' },
                });
                router.back();
            },
        });
    };

    return (
        <>
            <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
                <ExpoStatusBar style='dark' />
                <View className='w-full flex flex-row py-2.5 justify-between items-center px-5 relative'>
                    <TouchableOpacity
                        onPress={router.back}
                        className='bg-purple-100 px-4 py-2 flex items-center justify-center rounded-full'
                    >
                        <ArrowLeftIcon stroke='#9333EA' strokeWidth={2.5} />
                    </TouchableOpacity>

                    <View className='absolute left-0 right-0 items-center'>
                        <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                            Custom Category
                        </Text>
                    </View>
                </View>
                <ScrollView
                    className='space-y-5 flex-1 flex flex-col p-5'
                    contentContainerStyle={styles.scrollView}
                >
                    <View className='flex flex-col space-y-1'>
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
                            Category
                        </Text>

                        <View>
                            <Controller
                                control={control}
                                rules={{
                                    required: "Category can't be empty",
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <InputField
                                        className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                        style={satoshiFont.satoshiMedium}
                                        cursorColor={'#8B5CF6'}
                                        placeholder='Category'
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        value={value}
                                        autoCapitalize='none'
                                    />
                                )}
                                name='category'
                            />
                            {errors.category && (
                                <Text
                                    style={satoshiFont.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.category.message}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View className='flex flex-col space-y-1'>
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
                            Emoji
                        </Text>

                        <View>
                            <Controller
                                control={control}
                                rules={{
                                    required: "Emoji can't be empty",
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <InputField
                                        className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                        style={satoshiFont.satoshiMedium}
                                        cursorColor={'#8B5CF6'}
                                        placeholder='Emoji'
                                        onChangeText={(text) => {
                                            if (isEmoji(text) || text == '') onChange(text);
                                        }}
                                        onBlur={onBlur}
                                        value={value}
                                        autoCapitalize='none'
                                    />
                                )}
                                name='emoji'
                            />
                            {errors.emoji && (
                                <Text
                                    style={satoshiFont.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.emoji.message}
                                </Text>
                            )}
                        </View>
                    </View>
                </ScrollView>

                {/* <TouchableOpacity
                    className='items-center self-center justify-center px-4 absolute bottom-5'
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                >
                    <LinearGradient
                        className='flex items-center justify-center rounded-full px-5 w-[200] h-[50]'
                        colors={['#c084fc', '#9333ea']}
                    >
                        {isLoading ? (
                            <ActivityIndicator size={15} color='#fff' />
                        ) : (
                            <Text
                                style={satoshiFont.satoshiBlack}
                                className='text-white text-center'
                            >
                                Save
                            </Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity> */}

                <View className='items-center self-center justify-center px-5 absolute bottom-7 w-full'>
                    <View className='flex flex-row space-x-2.5 justify-between w-full'>
                        <View className='flex-1'>
                            <TouchableOpacity
                                onPress={router.back}
                                style={{ width: '100%' }}
                                className='bg-purple-50 border border-purple-100 items-center justify-center rounded-full px-5 h-[50]'
                            >
                                <Text
                                    style={satoshiFont.satoshiBlack}
                                    className='text-purple-600 text-center'
                                >
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View className='flex-1'>
                            <TouchableOpacity
                                style={{ width: '100%' }}
                                onPress={handleSubmit(onSubmit)}
                                disabled={isLoading}
                            >
                                <LinearGradient
                                    className='flex items-center justify-center rounded-full px-5 h-[50]'
                                    colors={['#c084fc', '#9333ea']}
                                    style={{ width: '100%' }}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size={15} color='#fff' />
                                    ) : (
                                        <Text
                                            style={satoshiFont.satoshiBlack}
                                            className='text-white text-center'
                                        >
                                            Save
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        paddingBottom: 100,
    },
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
