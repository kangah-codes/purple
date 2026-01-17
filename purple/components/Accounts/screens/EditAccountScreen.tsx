import { ArrowLeftIcon } from '@/components/SVG/icons/24x24';
import { usePreferences } from '@/components/Settings/hooks';
import FlagIcon from '@/components/Shared/atoms/FlagIcon';
import SearchableSelectField, {
    SelectOption,
} from '@/components/Shared/atoms/SearchableSelectField';
import SelectField from '@/components/Shared/atoms/SelectField';
import CurrencySelect from '@/components/Shared/molecules/CurrencySelect';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import {
    InputField,
    LinearGradient,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { ACCOUNT_SUBGROUP_TYPES, ACCOUNT_TYPES } from '@/lib/constants/accountTypes';
import { currencies } from '@/lib/constants/currencies';
import { satoshiFont } from '@/lib/constants/fonts';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Keyboard, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAccountStore, useEditAccount } from '../hooks';
import { EditAccount } from '../schema';

export default function EditAccountScreen() {
        React.useEffect(() => {
            logEvent('screen_view', {
                screen: 'edit_account_screen',
                source: 'navigation',
                account_id: currentAccount?.id,
            });
        }, [logEvent, currentAccount]);
    const {
        preferences: { currency },
    } = usePreferences();
    const { currentAccount } = useAccountStore();
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();
    const { mutate, isLoading } = useEditAccount();
    const { logEvent } = useAnalytics();
    const {
        control,
        handleSubmit,
        formState: { errors },
        getValues,
        setValue,
    } = useForm({
        defaultValues: {
            category: currentAccount?.category || '',
            subcategory: currentAccount?.subcategory || '',
            name: currentAccount?.name || '',
            currency: currentAccount?.currency || currency,
        },
    });

    const onSubmit = async (data: EditAccount) => {
        await logEvent('button_tap', {
            button: 'submit',
            screen: 'edit_account_screen',
            log: 'attempting to edit account',
            data,
        });
        Keyboard.dismiss();
        mutate(
            { id: currentAccount?.id ?? '', data },
            {
                onError: (err) => {
                    console.error('[EditAccountScreen] Error updating account:', err);
                    Toast.show({
                        type: 'error',
                        props: {
                            text1: 'Error!',
                            text2: 'There was an issue updating account',
                        },
                    });
                },
                onSuccess: async (res) => {
                    const { data } = res;

                    await logEvent('object_updated', {
                        object_type: 'account',
                        payload: data,
                    });
                    router.back();
                },
            },
        );
    };
    const renderSelectedCurrency = () => {
        const selectedCode = getValues('currency');
        const currency = currencies.find((c) => c.code === selectedCode);

        return (
            <View className='flex flex-row space-x-2 items-center -ml-2.5'>
                <FlagIcon currency={currency!} />
                <Text style={satoshiFont.satoshiBold} className='text-sm'>
                    {currency?.name} ({currency?.symbol})
                </Text>
            </View>
        );
    };

    const renderCurrencies = useCallback((item: SelectOption) => {
        const currency = currencies.find((currency) => currency.code === item.value)!;
        const selectedValue = getValues('currency');

        return (
            <CurrencySelect
                currency={currency}
                callback={() => {
                    setValue('currency', currency.code);
                    setShowBottomSheetFlatList('newCurrencyType', false);
                }}
                selectedCurrency={selectedValue}
            />
        );
    }, []);

    useEffect(() => {
        if (!currentAccount) {
            router.back();
        }
    }, [currentAccount]);

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
                            Edit Account
                        </Text>
                    </View>
                </View>
                <ScrollView
                    className='space-y-5 flex-1 flex flex-col p-5'
                    contentContainerStyle={styles.scrollView}
                >
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
                                            options={ACCOUNT_TYPES.reduce((acc, curr) => {
                                                acc[curr] = {
                                                    label: curr,
                                                    value: curr,
                                                };
                                                return acc;
                                            }, {} as Record<string, { label: string; value: string }>)}
                                            customSnapPoints={['50%', '55%', '60%']}
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
                            Subgroup
                        </Text>
                        <View>
                            <Controller
                                control={control}
                                rules={{
                                    required: "Subcategory can't be empty",
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <SelectField
                                            selectKey='newAccountSubcategory'
                                            options={(
                                                ACCOUNT_SUBGROUP_TYPES[
                                                    getValues(
                                                        'category',
                                                    ) as keyof typeof ACCOUNT_SUBGROUP_TYPES
                                                ] ?? []
                                            ).reduce((acc, curr) => {
                                                acc[curr] = {
                                                    label: curr,
                                                    value: curr,
                                                };
                                                return acc;
                                            }, {} as Record<string, { label: string; value: string }>)}
                                            customSnapPoints={['50%', '55%', '60%']}
                                            value={value}
                                            onChange={onChange}
                                        />
                                    </>
                                )}
                                name='subcategory'
                            />
                            {errors.subcategory && (
                                <Text
                                    style={satoshiFont.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.subcategory.message}
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
                                            renderSelectedItem={renderSelectedCurrency}
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
                                // @ts-expect-error TODO: fix later
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
