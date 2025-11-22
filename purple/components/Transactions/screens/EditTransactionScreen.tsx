import { useAccountStore } from '@/components/Accounts/hooks';
import { ArrowLeftIcon } from '@/components/SVG/icons/24x24';
import { usePreferences } from '@/components/Settings/hooks';
import DateAndTimePicker from '@/components/Shared/atoms/DateAndTimePicker';
import SelectField from '@/components/Shared/atoms/SelectField';
import { AnimatedPillSelect } from '@/components/Shared/molecules/AnimatedPillSelect';
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
import { EDITABLE_TRANSACTION_TYPES } from '@/lib/constants/transactionTypes';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import HTTPError from '@/lib/utils/error';
import { transformObject } from '@/lib/utils/object';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar as RNStatusBar,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useQueryClient } from 'react-query';
import { useEditTransaction, useTransactionStore } from '../hooks';
import { EditTransaction } from '../schema';

export default function EditTransactionScreen() {
    const { currentTransaction } = useTransactionStore();
    const {
        preferences: { customTransactionTypes },
    } = usePreferences();
    const queryClient = useQueryClient();
    const { accounts, getAccountById } = useAccountStore();
    const { logEvent } = useAnalytics();
    const [transactionType, setTransactionType] = useState<string>(
        currentTransaction?.type || 'debit',
    );
    const { mutate, isLoading } = useEditTransaction();
    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm({
        defaultValues: {
            amount: currentTransaction?.amount.toString() ?? '',
            category: currentTransaction?.category,
            note: currentTransaction?.note ?? '',
            type: transactionType,
            account_id: currentTransaction?.account_id ?? '',
            date: currentTransaction?.created_at ?? new Date().toISOString(),
            currency: '',
        },
    });
    const transactionTypes = useMemo(
        () =>
            customTransactionTypes.map(
                (transaction) => `${transaction.emoji} ${transaction.category}`,
            ),
        [customTransactionTypes],
    );
    useEffect(() => {
        setValue('type', transactionType);
    }, [transactionType, setValue]);

    const onSubmit = async (data: EditTransaction) => {
        await logEvent('button_tap', {
            button: 'submit',
            screen: 'new_transactiont_screen',
            log: 'attempting to create transaction',
            data,
        });
        Keyboard.dismiss();

        const account = getAccountById(data.account_id);
        if (!account) {
            await logEvent('error_occurred', {
                error_type: 'NOT_FOUND_ERROR',
                context: `Account with id ${data.account_id} not found`,
                severity: 'high',
            });
            Toast.show({
                type: 'error',
                props: { text1: 'Error!', text2: "Couldn't create transaction" },
            });
            return;
        }

        // @ts-expect-error expect
        const transformedData = transformObject(data, [
            ['amount', 'amount', (value) => Number(value)],
            ['currency', 'currency', () => account.currency],
        ]) as EditTransaction;

        mutate(
            {
                id: currentTransaction?.id ?? '',
                data: transformedData,
            },
            {
                onError: (error) => {
                    if (error instanceof HTTPError) {
                        Toast.show({
                            type: 'error',
                            props: { text1: 'Error!', text2: error.message },
                        });
                        return;
                    }
                    Toast.show({
                        type: 'error',
                        props: { text1: 'Error!', text2: "Couldn't edit transaction" },
                    });
                },
                onSuccess: () => {
                    queryClient.invalidateQueries({
                        queryKey: ['transactions', 'accounts', 'user'],
                    });
                    Toast.show({
                        type: 'success',
                        props: { text1: 'Success!', text2: 'Transaction updated successfully' },
                    });
                    router.back();
                },
            },
        );
    };

    useEffect(() => {
        if (!currentTransaction) {
            router.back();
            return;
        }
    }, [currentTransaction]);

    return (
        <>
            <SafeAreaView
                className='bg-white relative h-full'
                style={{
                    paddingTop: RNStatusBar.currentHeight,
                }}
            >
                <ExpoStatusBar style='dark' />
                <View className='flex flex-col space-y-2.5 px-5'>
                    <View className='w-full flex flex-row py-2.5 justify-between items-center relative'>
                        <TouchableOpacity
                            onPress={router.back}
                            className='bg-purple-100 px-4 py-2 flex items-center justify-center rounded-full'
                        >
                            <ArrowLeftIcon stroke='#9333EA' strokeWidth={2.5} />
                        </TouchableOpacity>

                        <View className='absolute left-0 right-0 items-center'>
                            <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                                Edit Transaction
                            </Text>
                        </View>
                    </View>

                    <View className='w-full'>
                        <AnimatedPillSelect<string>
                            options={EDITABLE_TRANSACTION_TYPES.map((t) => ({
                                label: t.label,
                                value: t.key,
                            }))}
                            selected={transactionType}
                            onChange={setTransactionType}
                            styling={{
                                pill: { backgroundColor: '#fff' },
                                background: {
                                    backgroundColor: 'rgb(243, 232, 255)',
                                    padding: 4,
                                    borderRadius: 999,
                                },
                                option: {
                                    padding: 12,
                                },
                            }}
                            renderItem={(opt, isSelected) => (
                                <Text
                                    style={[
                                        satoshiFont.satoshiBlack,
                                        { fontSize: 14 },
                                        isSelected ? { color: '#8200db' } : { color: '#c27aff' },
                                    ]}
                                >
                                    {opt.label}
                                </Text>
                            )}
                        />
                    </View>
                    <View className='h-1 border-b border-purple-100 w-full' />
                </View>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
                >
                    <ScrollView
                        className='space-y-5 flex-1 flex flex-col p-5'
                        contentContainerStyle={{
                            paddingBottom: 120,
                        }}
                    >
                        <View className='flex flex-col space-y-1'>
                            <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
                                Amount
                            </Text>

                            <View>
                                <Controller
                                    control={control}
                                    rules={{
                                        required: "Amount can't be empty",
                                        pattern: {
                                            value: /^\d+(\.\d{1,2})?$/,
                                            message: 'Amount must be a valid number',
                                        },
                                        min: {
                                            value: 0.01,
                                            message: 'Amount must be at least 0.01',
                                        },
                                    }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <InputField
                                            className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12'
                                            style={satoshiFont.satoshiMedium}
                                            cursorColor={'#8B5CF6'}
                                            placeholder='0.00'
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            keyboardType='numeric'
                                        />
                                    )}
                                    name='amount'
                                />
                                {errors.amount && (
                                    <Text
                                        style={satoshiFont.satoshiMedium}
                                        className='text-xs text-red-500'
                                    >
                                        {errors.amount.message}
                                    </Text>
                                )}
                            </View>
                        </View>

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
                                    render={({ field: { onChange, value } }) => (
                                        <>
                                            <SelectField
                                                selectKey='newTransactionCategory'
                                                options={transactionTypes.reduce((acc, curr) => {
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
                                        style={satoshiFont.satoshiMedium}
                                        className='text-xs text-red-500'
                                    >
                                        {errors.category.message}
                                    </Text>
                                )}
                            </View>
                        </View>

                        <View className='h-1 border-b border-purple-100 w-full' />

                        <View className='flex flex-col space-y-1'>
                            <Controller
                                control={control}
                                rules={{
                                    required: "Date can't be empty",
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <DateAndTimePicker
                                        label='Date'
                                        pickerKey='newTransactionStartDate'
                                        onChange={(date) => {
                                            // format "2006-01-02T15:04:05.000Z"
                                            onChange(date.toISOString());
                                        }}
                                        // selectedDate={value}
                                        // make maximim date today
                                        maximumDate={new Date()}
                                        value={new Date(value)}
                                    />
                                )}
                                name='date'
                            />
                            {errors.date && (
                                <Text
                                    style={satoshiFont.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.date.message}
                                </Text>
                            )}
                        </View>

                        <View className='h-1 border-b border-purple-100 w-full' />

                        <View className='flex flex-col space-y-1'>
                            <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
                                Account
                            </Text>
                            <View>
                                <Controller
                                    control={control}
                                    rules={{
                                        required: "Account can't be empty",
                                    }}
                                    render={({ field: { onChange, value } }) => (
                                        <>
                                            <SelectField
                                                selectKey='newTransactionAccount'
                                                options={accounts.reduce((acc, curr) => {
                                                    acc[curr.id] = {
                                                        label: curr.name,
                                                        value: curr.id,
                                                    };
                                                    return acc;
                                                }, {} as Record<string, { label: string; value: string }>)}
                                                customSnapPoints={['50%', '70%']}
                                                value={value}
                                                onChange={(val) => {
                                                    onChange(val);
                                                    setValue('account_id', val);
                                                }}
                                            />
                                        </>
                                    )}
                                    name='account_id'
                                />
                                {errors.account_id && (
                                    <Text
                                        style={satoshiFont.satoshiMedium}
                                        className='text-xs text-red-500'
                                    >
                                        {errors.account_id.message}
                                    </Text>
                                )}
                            </View>
                        </View>

                        <View className='flex flex-col space-y-1'>
                            <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
                                Note
                            </Text>

                            <View>
                                <Controller
                                    control={control}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <InputField
                                            className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12'
                                            style={satoshiFont.satoshiMedium}
                                            cursorColor={'#8B5CF6'}
                                            placeholder='Add a note...'
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                        />
                                    )}
                                    name='note'
                                />
                                {errors.note && (
                                    <Text
                                        style={satoshiFont.satoshiMedium}
                                        className='text-xs text-red-500'
                                    >
                                        {errors.note.message}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

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
