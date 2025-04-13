import { Currency } from '@/@types/common';
import { useAuth } from '@/components/Auth/hooks';
import CustomModalSelectField from '@/components/Shared/atoms/CustomModalSelectField';
import DatePicker from '@/components/Shared/atoms/DatePicker';
import SearchableSelectField from '@/components/Shared/atoms/SearchableSelectField';
import SelectField from '@/components/Shared/atoms/SelectField';
import { useBottomSheetModalStore } from '@/components/Shared/molecules/GlobalBottomSheetModal/hooks';
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
import { transformObject } from '@/lib/utils/object';
import { nativeStorage } from '@/lib/utils/storage';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Keyboard,
    Platform,
    StatusBar as RNStatusBar,
    StyleSheet,
} from 'react-native';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';
import { useCreatePlan } from '../hooks';
import { CreatePlan } from '../schema';
import { currencies } from '@/lib/constants/currencies';

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

export default function NewPlanScreen() {
    const { sessionData } = useAuth();
    const [planCategories, setPlanCategories] = useState<string[]>([]);
    const { mutate, isLoading } = useCreatePlan({ sessionData: sessionData! });
    const { setShowBottomSheetModal } = useBottomSheetModalStore();

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<CreatePlan>({
        defaultValues: {
            type: '',
            category: 'test',
            target: 0.0,
            start_date: new Date().toISOString(),
            end_date: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
            deposit_frequency: '',
            push_notification: false,
            name: '',
            currency: sessionData?.user?.preferences?.preferred_currency ?? '',
        },
    });
    const renderCurrencies = useCallback((item: any) => {
        const currency = currencies.find((currency) => currency.code === item.value);

        return (
            <View className='py-3 border-b border-purple-100 flex flex-row space-x-2 items-center'>
                <Text style={GLOBAL_STYLESHEET.satoshiMedium} className='text-sm'>
                    {currency?.emojiFlag}
                    {'  '}
                    {currency?.name}
                </Text>
            </View>
        );
    }, []);

    const onSubmit = (data: CreatePlan) => {
        Keyboard.dismiss();
        let transformedData = transformObject(data, [
            ['target', 'target', (value) => Number(value)],
        ]);

        mutate(transformedData, {
            onError: (err) => {
                Toast.show({
                    type: 'error',
                    props: { text1: 'Error!', text2: err.message },
                });
            },
            onSuccess: () => {
                Toast.show({
                    type: 'success',
                    props: { text1: 'Success!', text2: 'Plan created successfully' },
                });
                router.replace('/(tabs)/plans');
            },
        });
    };

    useEffect(() => {
        const cachedTypes = nativeStorage.getItem<string[]>('transaction_types');
        if (cachedTypes) setPlanCategories(cachedTypes);
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
                        <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-lg'>
                            New Plan
                        </Text>
                    </View>

                    <TouchableOpacity onPress={router.back}>
                        <Text style={GLOBAL_STYLESHEET.satoshiMedium} className='text-purple-600'>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
                <ScrollView
                    className='space-y-5 flex-1 flex flex-col p-5'
                    contentContainerStyle={styles.container}
                >
                    <View className='flex flex-col space-y-1'>
                        <Text
                            style={GLOBAL_STYLESHEET.satoshiBold}
                            className='text-xs text-gray-600'
                        >
                            Plan Name
                        </Text>

                        <View>
                            <Controller
                                control={control}
                                rules={{
                                    required: "Plan name can't be empty",
                                }}
                                render={({ field: { onChange, value, onBlur } }) => (
                                    <InputField
                                        className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                        style={GLOBAL_STYLESHEET.satoshiMedium}
                                        cursorColor={'#8B5CF6'}
                                        placeholder='Plan Name'
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        value={value}
                                    />
                                )}
                                name='name'
                            />
                        </View>
                        {errors.name && (
                            <Text
                                style={GLOBAL_STYLESHEET.satoshiMedium}
                                className='text-xs text-red-500'
                            >
                                {errors.name.message}
                            </Text>
                        )}
                    </View>

                    <View className='flex flex-col space-y-1'>
                        <Text
                            style={GLOBAL_STYLESHEET.satoshiBold}
                            className='text-xs text-gray-600'
                        >
                            Plan Type
                        </Text>
                        <View>
                            <Controller
                                control={control}
                                rules={{
                                    required: "Plan type can't be empty",
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <CustomModalSelectField
                                            sheetKey='newPlanTypes'
                                            customSnapPoints={['35%', '35%']}
                                            value={value}
                                        >
                                            <View className='w-full px-5 py-2.5 flex flex-row justify-between'>
                                                <View
                                                    className='flex-1 mr-2.5 flex flex-col space-y-2 bg-purple-100 rounded-2xl'
                                                    style={{
                                                        borderColor:
                                                            value === 'saving'
                                                                ? '#8B5CF6'
                                                                : 'transparent',
                                                        borderWidth: value === 'saving' ? 2.5 : 0,
                                                    }}
                                                >
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            onChange('saving');
                                                            setShowBottomSheetModal(
                                                                'newPlanTypes',
                                                                false,
                                                            );
                                                        }}
                                                    >
                                                        <View className='flex flex-col space-y-5 items-center justify-center'>
                                                            <View className='pt-5'>
                                                                <Image
                                                                    source={require('@/assets/images/graphics/3.png')}
                                                                    style={tw`h-24 w-24`}
                                                                />
                                                            </View>
                                                            <View className='flex flex-col space-y-1 w-full px-5'>
                                                                <Text
                                                                    style={
                                                                        GLOBAL_STYLESHEET.satoshiBlack
                                                                    }
                                                                    className='text-xl text-black'
                                                                >
                                                                    Saving
                                                                </Text>
                                                                <Text
                                                                    style={
                                                                        GLOBAL_STYLESHEET.satoshiMedium
                                                                    }
                                                                    className='text-sm text-gray-600'
                                                                >
                                                                    Save money for a specific goal
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                                <View
                                                    className='flex-1 ml-2.5 flex flex-col space-y-2 bg-purple-100 rounded-2xl'
                                                    style={{
                                                        borderColor:
                                                            value === 'expense'
                                                                ? '#8B5CF6'
                                                                : 'transparent',
                                                        borderWidth: value === 'expense' ? 2.5 : 0,
                                                    }}
                                                >
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            onChange('expense');
                                                            setShowBottomSheetModal(
                                                                'newPlanTypes',
                                                                false,
                                                            );
                                                        }}
                                                    >
                                                        <View className='flex flex-col space-y-5 items-start justify-center'>
                                                            <Image
                                                                source={require('@/assets/images/graphics/2.png')}
                                                                style={tw`h-24 w-[95%]`}
                                                            />
                                                            <View className='flex flex-col space-y-1 w-full p-5'>
                                                                <Text
                                                                    style={
                                                                        GLOBAL_STYLESHEET.satoshiBlack
                                                                    }
                                                                    className='text-xl text-black'
                                                                >
                                                                    Expense
                                                                </Text>
                                                                <Text
                                                                    style={
                                                                        GLOBAL_STYLESHEET.satoshiMedium
                                                                    }
                                                                    className='text-sm text-gray-600'
                                                                >
                                                                    Put money aside for a projected
                                                                    expense
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </CustomModalSelectField>
                                    </>
                                )}
                                name='type'
                            />
                            {errors.type && (
                                <Text
                                    style={GLOBAL_STYLESHEET.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.type.message}
                                </Text>
                            )}
                        </View>
                    </View>

                    <View className='flex flex-col space-y-1'>
                        <Text
                            style={GLOBAL_STYLESHEET.satoshiBold}
                            className='text-xs text-gray-600'
                        >
                            Plan Category
                        </Text>
                        <View>
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <SelectField
                                            selectKey='newPlanCategory'
                                            options={planCategories.reduce(
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
                                            customSnapPoints={['50%', '70%']}
                                            value={value}
                                            onChange={onChange}
                                            // renderItem={(item) => (
                                            //     <View className='w-[105%] border items-center border-purple-200 bg-purple-50 rounded-xl my-0.5 flex flex-row p-2.5 -mx-2.5'>
                                            //         <View className='h-5 w-5 bg-purple-500 rounded-full' />
                                            //         <Text
                                            //             style={GLOBAL_STYLESHEET.satoshiMedium}
                                            //             className='text-base text-black'
                                            //         >
                                            //             {item.label}
                                            //         </Text>
                                            //     </View>
                                            // )}
                                        />
                                    </>
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
                                                    };
                                                    return acc;
                                                },
                                                {} as Record<
                                                    string,
                                                    { label: string; value: string }
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
                                    style={GLOBAL_STYLESHEET.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.currency.message}
                                </Text>
                            )}
                        </View>
                    </View>

                    <View className='flex flex-col space-y-1'>
                        <Text
                            style={GLOBAL_STYLESHEET.satoshiBold}
                            className='text-xs text-gray-600'
                        >
                            Target
                        </Text>

                        <View>
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
                                            style={GLOBAL_STYLESHEET.satoshiMedium}
                                            cursorColor={'#8B5CF6'}
                                            placeholder='0.00'
                                            keyboardType='numeric'
                                            onChangeText={onChange}
                                            // may the typescript gods forgive me
                                            value={value as unknown as string}
                                        />
                                    </>
                                )}
                                name='target'
                            />
                        </View>
                        {errors.target && (
                            <Text
                                style={GLOBAL_STYLESHEET.satoshiMedium}
                                className='text-xs text-red-500'
                            >
                                {errors.target.message}
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
                                    // maximumDate={new Date()}
                                    value={new Date(value)}
                                    minimumDate={new Date()}
                                />
                            )}
                            name='start_date'
                        />
                        {errors.start_date && (
                            <Text
                                style={GLOBAL_STYLESHEET.satoshiMedium}
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
                                    // make minimum date tomorrow
                                    value={new Date(value)}
                                    minimumDate={
                                        new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
                                    }
                                />
                            )}
                            name='end_date'
                        />
                        {errors.end_date && (
                            <Text
                                style={GLOBAL_STYLESHEET.satoshiMedium}
                                className='text-xs text-red-500'
                            >
                                {errors.end_date.message}
                            </Text>
                        )}
                    </View>

                    <View className='h-1 border-b border-gray-100 w-full' />

                    <View className='flex flex-col space-y-1'>
                        <Text
                            style={GLOBAL_STYLESHEET.satoshiBold}
                            className='text-xs text-gray-600'
                        >
                            Deposit Frequency
                        </Text>
                        <View>
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
                                            customSnapPoints={['20%', '30%']}
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
                        </View>
                        {errors.deposit_frequency && (
                            <Text
                                style={GLOBAL_STYLESHEET.satoshiMedium}
                                className='text-xs text-red-500'
                            >
                                {errors.deposit_frequency.message}
                            </Text>
                        )}
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
                                Create Plan
                            </Text>
                        )}
                    </LinearGradient>
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
        paddingBottom: 200,
    },
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
