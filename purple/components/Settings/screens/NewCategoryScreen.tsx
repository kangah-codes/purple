import { ArrowLeftIcon } from '@/components/SVG/24x24';
import { useCreateCategory, usePreferences } from '@/components/Settings/hooks';
import {
    InputField,
    LinearGradient,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { isEmoji } from '@/lib/utils/string';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Keyboard, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

export default function NewCategoryScreen() {
    const {
        preferences: { currency },
        addCategory,
    } = usePreferences();
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

    const onSubmit = (data: { emoji: string; category: string }) => {
        Keyboard.dismiss();
        mutate(data, {
            onError: (err) => {
                Toast.show({
                    type: 'error',
                    props: { text1: 'Error!', text2: 'Error creating category' },
                });
            },
            onSuccess: (res) => {
                addCategory(data);
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
                        <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-lg'>
                            Custom Category
                        </Text>
                    </View>
                </View>
                <ScrollView
                    className='space-y-5 flex-1 flex flex-col p-5'
                    contentContainerStyle={styles.scrollView}
                >
                    <View className='flex flex-col space-y-1'>
                        <Text
                            style={GLOBAL_STYLESHEET.satoshiBold}
                            className='text-xs text-gray-600'
                        >
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
                                        style={GLOBAL_STYLESHEET.satoshiMedium}
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
                                    style={GLOBAL_STYLESHEET.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.category.message}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View className='flex flex-col space-y-1'>
                        <Text
                            style={GLOBAL_STYLESHEET.satoshiBold}
                            className='text-xs text-gray-600'
                        >
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
                                        style={GLOBAL_STYLESHEET.satoshiMedium}
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
                                    style={GLOBAL_STYLESHEET.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.emoji.message}
                                </Text>
                            )}
                        </View>
                    </View>
                </ScrollView>

                <TouchableOpacity
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
                                style={GLOBAL_STYLESHEET.satoshiBlack}
                                className='text-white text-center'
                            >
                                Save
                            </Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
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
