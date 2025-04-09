import { useAccountStore } from '@/components/Accounts/hooks';
import { useAuth } from '@/components/Auth/hooks';
import DatePicker from '@/components/Shared/atoms/DatePicker';
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
import { TRANSACTION_TYPES, transactionTypes } from '@/lib/constants/transactionTypes';
import { omit, transformObject } from '@/lib/utils/object';
import { nativeStorage } from '@/lib/utils/storage';
import { router, useLocalSearchParams } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Keyboard, StatusBar as RNStatusBar } from 'react-native';
import Toast from 'react-native-toast-message';
import { useCreateTransaction, useTransactionStore } from '../hooks';
import { capitaliseFirstLetter } from '@/lib/utils/string';
import { useQueryClient } from 'react-query';

export default function NewTransactionScreen() {
    const { type, accountId } = useLocalSearchParams();
    const { sessionData } = useAuth();
    const queryClient = useQueryClient();
    const { accounts } = useAccountStore();
    const { updateTransactions } = useTransactionStore();
    const [transactionType, setTransactionType] = useState<string>((type as string) ?? 'debit');
    const [transactionCategories, setTransactionCategories] = useState<string[]>([]);
    const { mutate, isLoading } = useCreateTransaction({ sessionData: sessionData! });
    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm({
        defaultValues: {
            amount: '',
            category: '',
            note: '',
            fromAccount: type == 'transfer' ? ((accountId as string) ?? '') : '',
            toAccount: '',
            type: '',
            accountId: (accountId as string) ?? '',
            date: new Date().toISOString(),
        },
    });
    useEffect(() => {
        setValue('type', transactionType);
        const getCachedConstants = async () => {
            const cachedTypes = nativeStorage.getItem<string[]>('transaction_types');
            if (cachedTypes) setTransactionCategories(cachedTypes);
        };
        getCachedConstants();
    }, [transactionType, setValue]);

    const onSubmit = (data: {
        amount: string;
        category: string;
        note: string;
        fromAccount?: string;
        toAccount?: string;
        type: string;
        accountId?: string;
        date: string;
    }) => {
        Keyboard.dismiss();
        let transformedData = transformObject(data, [
            ['toAccount', 'to_account'],
            ['fromAccount', 'from_account'],
            ['accountId', 'account_id', (value) => (Boolean(value) ? value : data.fromAccount)],
            ['amount', 'amount', (value) => Number(value)],
        ]);

        if (transactionType !== 'transfer') {
            transformedData = omit(transformedData, [
                'from_account',
                'to_account',
            ]) as typeof transformedData; // looks hacky af
        }

        console.log(transformedData, 'MUTATE');

        // TODO: refactor all creates to use server errors
        mutate(transformedData, {
            onError: (err) => {
                Toast.show({
                    type: 'error',
                    props: { text1: 'Error!', text2: capitaliseFirstLetter(err.message) },
                });
            },
            onSuccess: (res) => {
                // updateTransactions(res.data);
                queryClient.invalidateQueries([`transactions`]);
                Toast.show({
                    type: 'success',
                    props: { text1: 'Success!', text2: 'Transaction created successfully' },
                });
                // router.replace('/(tabs)/transactions');
                router.back();
            },
        });
    };

    const renderAccountFields = () => {
        if (transactionType === 'transfer') {
            return (
                <View className='flex flex-col space-y-5'>
                    <View className='flex flex-col space-y-1'>
                        <Text
                            style={GLOBAL_STYLESHEET.satoshiBold}
                            className='text-xs text-gray-600'
                        >
                            Debit Account
                        </Text>
                        <View>
                            <Controller
                                control={control}
                                rules={{
                                    required: "Debit account can't be empty",
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <SelectField
                                            selectKey='newTransactionDebitAccount'
                                            options={accounts.reduce(
                                                (acc, curr) => {
                                                    acc[curr.id] = {
                                                        label: curr.name,
                                                        value: curr.id,
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
                                            onChange={(val) => {
                                                onChange(val);
                                                setValue('fromAccount', val);
                                            }}
                                        />
                                    </>
                                )}
                                name='fromAccount'
                            />
                            {errors.fromAccount && (
                                <Text
                                    style={GLOBAL_STYLESHEET.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.fromAccount.message}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View className='flex flex-col space-y-1'>
                        <Text
                            style={GLOBAL_STYLESHEET.satoshiBold}
                            className='text-xs text-gray-600'
                        >
                            Credit Account
                        </Text>
                        <View>
                            <Controller
                                control={control}
                                rules={{
                                    required: "Credit account can't be empty",
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <SelectField
                                            selectKey='newTransactionCreditAccount'
                                            options={accounts.reduce(
                                                (acc, curr) => {
                                                    acc[curr.id] = {
                                                        label: curr.name,
                                                        value: curr.id,
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
                                            onChange={(val) => {
                                                onChange(val);
                                                setValue('toAccount', val);
                                            }}
                                        />
                                    </>
                                )}
                                name='toAccount'
                            />
                            {errors.toAccount && (
                                <Text
                                    style={GLOBAL_STYLESHEET.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.toAccount.message}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            );
        }
        return (
            <View className='flex flex-col space-y-1'>
                <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-xs text-gray-600'>
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
                                    options={accounts.reduce(
                                        (acc, curr) => {
                                            acc[curr.id] = {
                                                label: curr.name,
                                                value: curr.id,
                                            };
                                            return acc;
                                        },
                                        {} as Record<string, { label: string; value: string }>,
                                    )}
                                    customSnapPoints={['50%', '70%']}
                                    value={value}
                                    onChange={(val) => {
                                        onChange(val);
                                        setValue('accountId', val);
                                    }}
                                />
                            </>
                        )}
                        name='accountId'
                    />
                    {errors.accountId && (
                        <Text
                            style={GLOBAL_STYLESHEET.satoshiMedium}
                            className='text-xs text-red-500'
                        >
                            {errors.accountId.message}
                        </Text>
                    )}
                </View>
            </View>
        );
    };

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
                    <View className='w-full flex flex-row py-2.5 justify-between items-center'>
                        <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-lg'>
                            New Transaction
                        </Text>

                        <TouchableOpacity onPress={router.back}>
                            <Text style={GLOBAL_STYLESHEET.satoshiBold} className='text-purple-600'>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className='w-full bg-purple-100 rounded-full p-1.5 flex flex-row space-x-1.5'>
                        {TRANSACTION_TYPES.map((transaction, i) => {
                            return (
                                <View
                                    className='flex-grow flex items-center justify-center rounded-full'
                                    style={{
                                        backgroundColor:
                                            transaction.key == transactionType
                                                ? '#fff'
                                                : 'rgb(243 232 255)',
                                    }}
                                    key={transaction.key}
                                >
                                    <TouchableOpacity
                                        onPress={() => setTransactionType(transaction.key)}
                                        className='w-full flex items-center justify-center py-2.5 rounded-full'
                                    >
                                        <Text
                                            style={GLOBAL_STYLESHEET.satoshiBlack}
                                            className='text-sm'
                                        >
                                            {transaction.label}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                    <View className='h-1 border-b border-gray-100 w-full' />
                </View>
                <ScrollView
                    className='space-y-5 flex-1 flex flex-col p-5'
                    contentContainerStyle={{
                        paddingBottom: 100,
                    }}
                >
                    <View className='flex flex-col space-y-1'>
                        <Text
                            style={GLOBAL_STYLESHEET.satoshiBold}
                            className='text-xs text-gray-600'
                        >
                            Amount
                        </Text>

                        <View>
                            <Controller
                                control={control}
                                rules={{
                                    required: "Amount can't be empty",
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <InputField
                                        className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12'
                                        style={GLOBAL_STYLESHEET.satoshiMedium}
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
                                    style={GLOBAL_STYLESHEET.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.amount.message}
                                </Text>
                            )}
                        </View>
                    </View>

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
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <SelectField
                                            selectKey='newTransactionCategory'
                                            options={transactionTypes.reduce(
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

                    <View className='h-1 border-b border-gray-100 w-full' />

                    <View className='flex flex-col space-y-1'>
                        <Controller
                            control={control}
                            rules={{
                                required: "Date can't be empty",
                            }}
                            render={({ field: { onChange, value } }) => (
                                <DatePicker
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
                                style={GLOBAL_STYLESHEET.satoshiMedium}
                                className='text-xs text-red-500'
                            >
                                {errors.date.message}
                            </Text>
                        )}
                    </View>

                    <View className='h-1 border-b border-gray-100 w-full' />

                    {renderAccountFields()}

                    <View className='flex flex-col space-y-1'>
                        <Text
                            style={GLOBAL_STYLESHEET.satoshiBold}
                            className='text-xs text-gray-600'
                        >
                            Note
                        </Text>

                        <View>
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <InputField
                                        className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12'
                                        style={GLOBAL_STYLESHEET.satoshiMedium}
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
                                    style={GLOBAL_STYLESHEET.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.note.message}
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
