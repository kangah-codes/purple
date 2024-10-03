import SelectField from '@/components/Shared/atoms/SelectField';
import {
    InputField,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { nativeStorage } from '@/lib/utils/storage';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useEffect } from 'react';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Keyboard, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import { useAccountStore, useCreateAccount } from '../hooks';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/components/Auth/hooks';
import { Currency } from '@/@types/common';
import { Image } from 'expo-image';
import tw from 'twrnc';
import SearchableSelectField from '@/components/Shared/atoms/SearchableSelectField';
export default function NewAccountScreen() {
    const { sessionData } = useAuth();
    const [accountGroups, setAccountsGroups] = useState<string[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const { updateAccounts } = useAccountStore();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            category: '',
            name: '',
            balance: '0',
            currency: '',
        },
    });
    const { mutate, isLoading } = useCreateAccount({ sessionData: sessionData! });

    const onSubmit = (data: { category: string; name: string; balance: string }) => {
        Keyboard.dismiss();
        mutate(
            {
                ...data,
                balance: Number(data.balance),
            },
            {
                onError: () => {
                    Toast.show({
                        type: 'error',
                        props: {
                            text1: 'Error!',
                            text2: 'There was an issue creating account',
                        },
                    });
                },
                onSuccess: (res) => {
                    const { data } = res;
                    updateAccounts(data);
                    Toast.show({
                        type: 'success',
                        props: {
                            text1: 'Success!',
                            text2: 'Account created successfully',
                        },
                    });
                    router.replace('/(tabs)/accounts');
                },
            },
        );
    };

    const renderItem = useCallback((item: any) => {
        return (
            <View className='py-3 border-b border-gray-100'>
                <Text style={GLOBAL_STYLESHEET.interSemiBold} className='tracking-tight'>
                    {item.label}
                </Text>
            </View>
        );
    }, []);

    const renderCurrencies = useCallback(
        (item: any) => {
            return (
                <View className='py-3 border-b border-gray-100 flex flex-row space-x-2 items-center'>
                    <Image
                        source={
                            currencies.find((currency) => currency.code === item.value)?.flag || ''
                        }
                        style={tw`h-5 w-5 rounded-full`}
                    />
                    <Text style={GLOBAL_STYLESHEET.interSemiBold} className='tracking-tight'>
                        {item.label}
                    </Text>
                </View>
            );
        },
        [currencies],
    );

    useEffect(() => {
        const getAccountGroups = async () => {
            const groups = await nativeStorage.getItem<string[]>('account_groups');
            if (groups) setAccountsGroups(groups);

            const currencies = await nativeStorage.getItem<Currency[]>('currencies');
            if (currencies) setCurrencies(currencies);
        };

        getAccountGroups();
    }, []);

    if (!accountGroups.length) return null;

    return (
        <>
            <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
                <ExpoStatusBar style='dark' />
                <View className='w-full flex flex-row px-5 py-2.5 justify-between items-center'>
                    <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg'>
                        New Account
                    </Text>

                    <TouchableOpacity onPress={router.back}>
                        <Text style={GLOBAL_STYLESHEET.interSemiBold} className='text-purple-600'>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
                <ScrollView
                    className='space-y-5 flex-1 flex flex-col p-5'
                    contentContainerStyle={styles.scrollView}
                >
                    <Text style={{ fontFamily: 'InterBold' }} className='text-xs text-gray-600'>
                        Category
                    </Text>
                    <>
                        <Controller
                            control={control}
                            rules={{
                                required: "Category can't be empty",
                            }}
                            render={({ field: { onChange, value } }) => (
                                <>
                                    <SelectField
                                        selectKey='newPlanType'
                                        options={accountGroups.reduce((acc, curr) => {
                                            acc[curr] = {
                                                label: curr,
                                                value: curr,
                                            };
                                            return acc;
                                        }, {} as Record<string, { label: string; value: string }>)}
                                        customSnapPoints={['50%', '55%', '60%']}
                                        renderItem={renderItem}
                                        value={value}
                                        onChange={onChange}
                                    />
                                </>
                            )}
                            name='category'
                        />
                        {errors.category && (
                            <Text
                                style={{ fontFamily: 'InterMedium' }}
                                className='text-xs text-red-500'
                            >
                                {errors.category.message}
                            </Text>
                        )}
                    </>
                    <View className='flex flex-col space-y-1'>
                        <Text style={{ fontFamily: 'InterBold' }} className='text-xs text-gray-600'>
                            Account Name
                        </Text>

                        <Controller
                            control={control}
                            rules={{
                                required: "Account name can't be empty",
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <InputField
                                    className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                    style={GLOBAL_STYLESHEET.interSemiBold}
                                    cursorColor={'#8B5CF6'}
                                    placeholder='Account name'
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={value}
                                    autoCapitalize='none'
                                />
                            )}
                            name='name'
                        />
                        {errors.name && (
                            <Text
                                style={{ fontFamily: 'InterMedium' }}
                                className='text-xs text-red-500'
                            >
                                {errors.name.message}
                            </Text>
                        )}
                    </View>
                    <View className='flex flex-col space-y-1'>
                        <Text style={{ fontFamily: 'InterBold' }} className='text-xs text-gray-600'>
                            Balance
                        </Text>

                        <Controller
                            control={control}
                            rules={{
                                required: "Balance can't be empty",
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <InputField
                                    className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                    style={GLOBAL_STYLESHEET.interSemiBold}
                                    cursorColor={'#8B5CF6'}
                                    placeholder='0.00'
                                    keyboardType='numeric'
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={value}
                                />
                            )}
                            name='balance'
                        />
                        {errors.balance && (
                            <Text
                                style={{ fontFamily: 'InterMedium' }}
                                className='text-xs text-red-500'
                            >
                                {errors.balance.message}
                            </Text>
                        )}
                    </View>
                    <View className='flex flex-col space-y-1'>
                        <Text style={{ fontFamily: 'InterBold' }} className='text-xs text-gray-600'>
                            Currency
                        </Text>
                        <>
                            <Controller
                                control={control}
                                rules={{
                                    required: "Currency can't be empty",
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <SearchableSelectField
                                            selectKey='newCurrencyType'
                                            options={currencies.reduce((acc, curr) => {
                                                acc[curr.code] = {
                                                    label: curr.name,
                                                    value: curr.code,
                                                };
                                                return acc;
                                            }, {} as Record<string, { label: string; value: string }>)}
                                            customSnapPoints={['80%', '90%']}
                                            renderItem={renderCurrencies}
                                            value={value}
                                            onChange={onChange}
                                        />
                                    </>
                                )}
                                name='currency'
                            />
                            {errors.currency && (
                                <Text
                                    style={{ fontFamily: 'InterMedium' }}
                                    className='text-xs text-red-500'
                                >
                                    {errors.currency.message}
                                </Text>
                            )}
                        </>
                    </View>
                </ScrollView>

                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                    className='items-center self-center w-[95%] justify-center px-4 absolute bottom-8'
                >
                    <View className='bg-purple-600 py-4 w-full flex items-center justify-center rounded-full'>
                        {isLoading ? (
                            <ActivityIndicator size={18} color='#fff' />
                        ) : (
                            <Text style={GLOBAL_STYLESHEET.suprapower} className='text-white'>
                                Create Account
                            </Text>
                        )}
                    </View>
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
