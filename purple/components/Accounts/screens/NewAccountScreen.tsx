import { usePreferences } from '@/components/Settings/hooks';
import SelectField from '@/components/Shared/atoms/SelectField';
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
import { ACCOUNT_TYPES } from '@/lib/constants/accountTypes';
import { currencies } from '@/lib/constants/currencies';
import { nativeStorage } from '@/lib/utils/storage';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Keyboard, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAccountStore, useCreateAccount } from '../hooks';
import { satoshiFont } from '@/lib/constants/fonts';
import { ArrowLeftIcon } from '@/components/SVG/24x24';
import SearchableSelectField, {
    SelectOption,
} from '@/components/Shared/atoms/SearchableSelectField';
import { CheckMarkIcon } from '@/components/SVG/noscale';

export default function NewAccountScreen() {
    const {
        preferences: { currency },
    } = usePreferences();
    const [accountGroups, setAccountsGroups] = useState<string[]>(ACCOUNT_TYPES);
    const { updateAccounts } = useAccountStore();
    const { mutate, isLoading } = useCreateAccount();
    const {
        control,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm({
        defaultValues: {
            category: '',
            name: '',
            balance: '0',
            currency,
        },
    });

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
            <View className='py-3 border-b border-purple-100'>
                <Text style={satoshiFont.satoshiBold} className='tracking-tight'>
                    {item.label}
                </Text>
            </View>
        );
    }, []);

    const renderCurrencies = useCallback((item: SelectOption) => {
        const currency = currencies.find((currency) => currency.code === item.value);
        const selectedValue = getValues('currency');

        return (
            <View className='py-3 border-b border-purple-100 flex flex-row justify-between space-x-2 items-center'>
                <Text style={satoshiFont.satoshiBold} className='text-sm'>
                    {currency?.emojiFlag}
                    {'  '}
                    {currency?.name}
                </Text>

                {selectedValue === currency?.code && (
                    <CheckMarkIcon strokeWidth={3} stroke={'#9810fa'} width={15} height={15} />
                )}
            </View>
        );
    }, []);

    useEffect(() => {
        const getAccountGroups = async () => {
            const groups = nativeStorage.getItem<string[]>('account_groups');
            if (groups) setAccountsGroups(groups);
        };

        getAccountGroups();
    }, []);

    if (!accountGroups.length) return null;

    return (
        <>
            <SafeAreaView className='bg-white relative h-full' style={styles.parentView}>
                <ExpoStatusBar style='dark' />
                <View className='w-full flex flex-row py-2.5 justify-between items-center relative px-5'>
                    <TouchableOpacity
                        onPress={router.back}
                        className='bg-purple-100 px-4 py-2 flex items-center justify-center rounded-full'
                    >
                        <ArrowLeftIcon stroke='#9333EA' strokeWidth={2.5} />
                    </TouchableOpacity>

                    <View className='absolute left-0 right-0 items-center'>
                        <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                            New Account
                        </Text>
                    </View>
                </View>
                <ScrollView
                    className='space-y-5 flex-1 flex flex-col p-5'
                    contentContainerStyle={styles.scrollView}
                >
                    <View className='flex flex-col space-y-1'>
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
                            Account Group
                        </Text>
                        <View>
                            <Controller
                                control={control}
                                rules={{
                                    required: "Category can't be empty",
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <SelectField
                                            selectKey='newPlanType'
                                            options={accountGroups.reduce(
                                                (acc, curr) => {
                                                    acc[curr] = {
                                                        label: curr,
                                                        value: curr,
                                                    };
                                                    return acc;
                                                },
                                                {} as Record<
                                                    string,
                                                    { label: string; value: string }
                                                >,
                                            )}
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
                            Account Name
                        </Text>

                        <View>
                            <Controller
                                control={control}
                                rules={{
                                    required: "Account name can't be empty",
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <InputField
                                        className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                        style={satoshiFont.satoshiMedium}
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
                                    style={satoshiFont.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.name.message}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View className='flex flex-col space-y-1'>
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
                            Balance
                        </Text>

                        <View>
                            <Controller
                                control={control}
                                rules={{
                                    required: "Balance can't be empty",
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <InputField
                                        className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                        style={satoshiFont.satoshiMedium}
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
                                    style={satoshiFont.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.balance.message}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View className='flex flex-col space-y-1'>
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
                            Currency
                        </Text>
                        <View>
                            <Controller
                                control={control}
                                rules={{
                                    required: "Currency can't be empty",
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <SearchableSelectField
                                            selectKey='newCurrencyType'
                                            options={currencies.reduce(
                                                (acc, curr) => {
                                                    acc[curr.code] = {
                                                        label: curr.name,
                                                        value: curr.code,
                                                        searchField: `${curr.code} ${curr.name} ${curr.country}`,
                                                    };
                                                    return acc;
                                                },
                                                {} as Record<
                                                    string,
                                                    {
                                                        label: string;
                                                        value: string;
                                                        searchField: string;
                                                    }
                                                >,
                                            )}
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
                                    style={satoshiFont.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.currency.message}
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
                                style={satoshiFont.satoshiBlack}
                                className='text-white text-center'
                            >
                                Create Account
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
