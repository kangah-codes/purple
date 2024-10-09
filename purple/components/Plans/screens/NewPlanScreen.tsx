import { useAccountStore } from '@/components/Accounts/hooks';
import DatePicker from '@/components/Shared/atoms/DatePicker';
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
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Switch,
    StatusBar as RNStatusBar,
    Keyboard,
} from 'react-native';
import { useCreatePlan } from '../hooks';
import { useAuth } from '@/components/Auth/hooks';
import { transformObject } from '@/lib/utils/object';
import Toast from 'react-native-toast-message';
import { CreatePlan } from '../schema';
import SearchableSelectField from '@/components/Shared/atoms/SearchableSelectField';
import { Currency } from '@/@types/common';
import { Image } from 'expo-image';
import tw from 'twrnc';

/**
 * 
 * @returns type CreatePlanDTO struct {
	AccountId        uuid.UUID `json:"account_id" binding:"required"`
	Type             string    `json:"type" binding:"required,oneof=saving expense"`
	Category         string    `json:"category" binding:"required"`
	Target           float64   `json:"target" validate:"number"`
	StartDate        string    `json:"start_date" binding:"required"`
	EndDate          string    `json:"end_date" binding:"required"`
	DepositFrequency string    `json:"deposit_frequency" binding:"required,oneof=daily weekly bi-weekly monthly yearly"`
	PushNotification bool      `json:"push_notification" binding:"required"`
	Name             string    `json:"name" binding:"required"`
}
 */

export default function NewPlanScreen() {
    const { sessionData } = useAuth();
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
    const [planCategories, setPlanCategories] = useState<string[]>([]);
    const { mutate, isLoading } = useCreatePlan({ sessionData: sessionData! });
    const [currencies, setCurrencies] = useState<Currency[]>([]);

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<CreatePlan>({
        defaultValues: {
            type: '',
            category: '',
            amount: 0.0,
            start_date: '',
            end_date: '',
            deposit_frequency: '',
            push_notification: false,
            name: '',
            currency: sessionData?.user.settings.default_currency ?? '',
        },
    });
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

    const planTypes = {
        expense: {
            label: '💸   Expense',
            value: 'expense',
        },
        saving: {
            label: '💰   Saving',
            value: 'saving',
        },
    };
    const depositFrequency = {
        weekly: {
            label: 'Weekly',
            value: 'weekly',
        },
        'bi-weekly': {
            label: 'Bi-Weekly',
            value: 'bi-weekly',
        },
        monthly: {
            label: 'Monthly',
            value: 'monthly',
        },
    };

    const onSubmit = (data: CreatePlan) => {
        Keyboard.dismiss();
        let transformedData = transformObject(data, [
            ['amount', 'amount', (value) => Number(value)],
        ]);

        console.log(transformedData);

        mutate(transformedData, {
            onError: () => {
                Toast.show({
                    type: 'error',
                    props: { text1: 'Error!', text2: 'There was an issue creating plan' },
                });
            },
            onSuccess: (res) => {
                Toast.show({
                    type: 'success',
                    props: { text1: 'Success!', text2: 'Plan created successfully' },
                });
                router.replace('/(tabs)/plans');
            },
        });
    };

    useEffect(() => {
        const getCachedConstants = async () => {
            const cachedTypes = await nativeStorage.getItem<string[]>('transaction_types');
            if (cachedTypes) setPlanCategories(cachedTypes);

            const currencies = await nativeStorage.getItem<Currency[]>('currencies');
            if (currencies) setCurrencies(currencies);
        };
        getCachedConstants();
    }, []);

    return (
        <>
            <SafeAreaView className='bg-white relative h-full'>
                <ExpoStatusBar style='dark' />
                <View
                    style={styles.parentView}
                    className='w-full flex flex-row px-5 py-2.5 justify-between items-center'
                >
                    <View className='flex flex-col'>
                        <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg'>
                            New Plan
                        </Text>
                    </View>

                    <TouchableOpacity onPress={router.back}>
                        <Text style={GLOBAL_STYLESHEET.interSemiBold} className='text-purple-600'>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
                <ScrollView
                    className='space-y-5 flex-1 flex flex-col p-5'
                    contentContainerStyle={styles.container}
                >
                    <View className='flex flex-col space-y-1'>
                        <Text style={GLOBAL_STYLESHEET.interBold} className='text-xs text-gray-600'>
                            Plan Name
                        </Text>

                        <Controller
                            control={control}
                            rules={{
                                required: "Debit account can't be empty",
                            }}
                            render={({ field: { onChange, value, onBlur } }) => (
                                <InputField
                                    className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                    style={GLOBAL_STYLESHEET.interSemiBold}
                                    cursorColor={'#8B5CF6'}
                                    placeholder='Plan Name'
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={value}
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

                    <View>
                        <Text style={{ fontFamily: 'InterBold' }} className='text-xs text-gray-600'>
                            Plan Type
                        </Text>
                        <>
                            <Controller
                                control={control}
                                rules={{
                                    required: "Plan type can't be empty",
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <SelectField
                                            selectKey='newPlanTypes'
                                            options={planTypes}
                                            customSnapPoints={['30%', '40%']}
                                            value={value}
                                            onChange={onChange}
                                        />
                                    </>
                                )}
                                name='type'
                            />
                            {errors.type && (
                                <Text
                                    style={{ fontFamily: 'InterMedium' }}
                                    className='text-xs text-red-500'
                                >
                                    {errors.type.message}
                                </Text>
                            )}
                        </>
                    </View>

                    <View>
                        <Text style={{ fontFamily: 'InterBold' }} className='text-xs text-gray-600'>
                            Plan Category
                        </Text>
                        <>
                            <Controller
                                control={control}
                                rules={{
                                    required: "Debit account can't be empty",
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <SelectField
                                            selectKey='newPlanCategory'
                                            options={planCategories.reduce((acc, curr) => {
                                                acc[curr] = {
                                                    label: curr,
                                                    value: curr,
                                                };
                                                return acc;
                                            }, {} as Record<string, { label: string; value: string }>)}
                                            customSnapPoints={['50%', '70%']}
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

                    <View className='flex flex-col space-y-1'>
                        <Text style={GLOBAL_STYLESHEET.interBold} className='text-xs text-gray-600'>
                            Target
                        </Text>

                        <Controller
                            control={control}
                            rules={{
                                required: "Target amount can't be empty",
                                min: {
                                    value: 1,
                                    message: 'Target amount must be greater than 0',
                                },
                            }}
                            render={({ field: { onChange, value } }) => (
                                <>
                                    <InputField
                                        className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                        style={GLOBAL_STYLESHEET.interSemiBold}
                                        cursorColor={'#8B5CF6'}
                                        placeholder='0.00'
                                        keyboardType='numeric'
                                        onChangeText={onChange}
                                        // may the typescript gods forgive me
                                        value={value as unknown as string}
                                    />
                                </>
                            )}
                            name='amount'
                        />
                        {errors.amount && (
                            <Text
                                style={{ fontFamily: 'InterMedium' }}
                                className='text-xs text-red-500'
                            >
                                {errors.amount.message}
                            </Text>
                        )}
                    </View>

                    <View className='h-1 border-b border-gray-100 w-full' />

                    <View className='flex flex-col space-y-1'>
                        <Controller
                            control={control}
                            rules={{
                                required: "Start date can't be empty",
                            }}
                            render={({ field: { onChange, value } }) => (
                                <DatePicker
                                    label='Start Date'
                                    pickerKey='newPlanStartDate'
                                    onChange={(date) => {
                                        // format "2006-01-02T15:04:05.000Z"
                                        onChange(date.toISOString());
                                    }}
                                    // selectedDate={value}
                                    // make maximim date today
                                    maximumDate={new Date()}
                                    minimumDate={new Date()}
                                />
                            )}
                            name='start_date'
                        />
                        {errors.start_date && (
                            <Text
                                style={{ fontFamily: 'InterMedium' }}
                                className='text-xs text-red-500'
                            >
                                {errors.start_date.message}
                            </Text>
                        )}
                    </View>

                    <View className='flex flex-col space-y-1'>
                        <Controller
                            control={control}
                            rules={{
                                required: "End date can't be empty",
                            }}
                            render={({ field: { onChange, value } }) => (
                                <DatePicker
                                    label='End Date'
                                    pickerKey='newPlanEndDate'
                                    onChange={(date) => {
                                        // format "2006-01-02T15:04:05.000Z"
                                        onChange(date.toISOString());
                                    }}
                                    // selectedDate={value}
                                    // make maximim date today
                                    minimumDate={new Date()}
                                />
                            )}
                            name='end_date'
                        />
                        {errors.end_date && (
                            <Text
                                style={{ fontFamily: 'InterMedium' }}
                                className='text-xs text-red-500'
                            >
                                {errors.end_date.message}
                            </Text>
                        )}
                    </View>

                    <View className='h-1 border-b border-gray-100 w-full' />

                    <View>
                        <Text style={GLOBAL_STYLESHEET.interBold} className='text-xs text-gray-600'>
                            Deposit Frequency
                        </Text>
                        <Controller
                            control={control}
                            rules={{
                                required: "Deposit Frequency can't be empty",
                            }}
                            render={({ field: { onChange, value } }) => (
                                <>
                                    <SelectField
                                        selectKey='newPlanDepositFrequency'
                                        options={depositFrequency}
                                        customSnapPoints={['50%', '70%']}
                                        value={value}
                                        onChange={(val) => {
                                            onChange(val);
                                            setValue('deposit_frequency', val);
                                        }}
                                    />
                                </>
                            )}
                            name='deposit_frequency'
                        />
                        {errors.deposit_frequency && (
                            <Text
                                style={{ fontFamily: 'InterMedium' }}
                                className='text-xs text-red-500'
                            >
                                {errors.deposit_frequency.message}
                            </Text>
                        )}
                    </View>

                    <View className='flex flex-row justify-between items-center'>
                        <Text style={GLOBAL_STYLESHEET.interBold} className='text-xs text-gray-600'>
                            Send me reminders
                        </Text>

                        <Controller
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Switch
                                    trackColor={{ false: '#767577', true: '#8B5CF6' }}
                                    thumbColor={'#f4f3f4'}
                                    ios_backgroundColor='#3e3e3e'
                                    onValueChange={onChange}
                                    value={value}
                                    style={styles.switch}
                                />
                            )}
                            name='push_notification'
                        />
                        {errors.push_notification && (
                            <Text
                                style={{ fontFamily: 'InterMedium' }}
                                className='text-xs text-red-500'
                            >
                                {errors.push_notification.message}
                            </Text>
                        )}
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
                                Create Plan
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    switch: {
        transform: Platform.OS === 'ios' ? [{ scaleX: 0.8 }, { scaleY: 0.8 }] : [],
    },
    container: {
        paddingBottom: 100,
    },
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
