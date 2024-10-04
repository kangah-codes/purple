import { useAccountStore } from '@/components/Accounts/hooks';
import { useAuth } from '@/components/Auth/hooks';
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
import { router, useLocalSearchParams } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React from 'react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Keyboard, StatusBar as RNStatusBar } from 'react-native';
import { useCreateTransaction, useTransactionStore } from '../hooks';
import Toast from 'react-native-toast-message';
import { transformObject } from '@/lib/utils/object';

export default function NewTransactionScreen() {
    const { type, accountId } = useLocalSearchParams();
    const { sessionData } = useAuth();
    const { accounts } = useAccountStore();
    const { updateTransactions } = useTransactionStore();
    const [isEnabled, setIsEnabled] = useState(false);
    const [transactionType, setTransactionType] = useState<string>((type as string) ?? 'debit');
    const [transactionCategories, setTransactionCategories] = useState<string[]>([]);
    const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
    const [transactionTypes] = useState([
        {
            key: 'debit',
            label: 'Expense',
        },
        {
            key: 'credit',
            label: 'Income',
        },
        {
            key: 'transfer',
            label: 'Transfer',
        },
    ]);
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
            fromAccount: '',
            toAccount: '',
            type: '',
            accountId: '',
            date: new Date().toISOString(),
        },
    });
    const { mutate, isLoading } = useCreateTransaction({ sessionData: sessionData! });

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
        console.log(
            transformObject(data, [
                ['toAccount', 'to_account'],
                ['fromAccount', 'from_account'],
                ['accountId', 'account_id'],
                ['amount', 'amount', (value) => Number(value)],
            ]),
        );
        Keyboard.dismiss();
        mutate(
            transformObject(data, [
                ['toAccount', 'to_account'],
                ['fromAccount', 'from_account'],
                ['accountId', 'account_id'],
                ['amount', 'amount', (value) => Number(value)],
            ]),
            {
                onError: () => {
                    Toast.show({
                        type: 'error',
                        props: {
                            text1: 'Error!',
                            text2: 'There was an issue creating transaction',
                        },
                    });
                },
                onSuccess: (res) => {
                    const { data } = res;
                    updateTransactions(data);
                    Toast.show({
                        type: 'success',
                        props: {
                            text1: 'Success!',
                            text2: 'Transaction created successfully',
                        },
                    });
                    router.replace('/(tabs)/transactions');
                },
            },
        );
    };

    useEffect(() => {
        setValue('type', transactionType);
    }, [transactionType]);

    useEffect(() => {
        const getCachedConstants = async () => {
            const transactionTypes = await nativeStorage.getItem<string[]>('transaction_types');
            if (transactionTypes) setTransactionCategories(transactionTypes);
        };

        getCachedConstants();
    }, []);

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
                        <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg'>
                            New Transaction
                        </Text>

                        <TouchableOpacity onPress={router.back}>
                            <Text
                                style={GLOBAL_STYLESHEET.interSemiBold}
                                className='text-purple-600'
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className='w-full bg-purple-100 rounded-full p-1.5 flex flex-row space-x-1.5'>
                        {transactionTypes.map((transaction, i) => {
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
                                            style={GLOBAL_STYLESHEET.suprapower}
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
                        <Text style={GLOBAL_STYLESHEET.interBold} className='text-xs text-gray-600'>
                            Amount
                        </Text>

                        <Controller
                            control={control}
                            rules={{
                                required: "Amount can't be empty",
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <InputField
                                    className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                    style={GLOBAL_STYLESHEET.interSemiBold}
                                    cursorColor={'#8B5CF6'}
                                    keyboardType='numeric'
                                    placeholder='0.00'
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={value}
                                />
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

                    <View>
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
                                            selectKey='newTransactionCategory'
                                            options={transactionCategories.reduce((acc, curr) => {
                                                acc[curr] = {
                                                    label: curr,
                                                    value: curr,
                                                };
                                                return acc;
                                            }, {} as Record<string, { label: string; value: string }>)}
                                            customSnapPoints={['30%', '40%']}
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
                                />
                            )}
                            name='date'
                        />
                        {errors.date && (
                            <Text
                                style={{ fontFamily: 'InterMedium' }}
                                className='text-xs text-red-500'
                            >
                                {errors.date.message}
                            </Text>
                        )}
                    </View>

                    <View className='h-1 border-b border-gray-100 w-full' />

                    {
                        // rendering different account fields based on transaction type
                        transactionType === 'transfer' ? (
                            <View className='flex flex-col space-y-5'>
                                <View>
                                    <Text
                                        style={{ fontFamily: 'InterBold' }}
                                        className='text-xs text-gray-600'
                                    >
                                        Debit Account
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
                                                        selectKey='newTransactionDebitAccount'
                                                        options={accounts.reduce((acc, curr) => {
                                                            acc[curr.ID] = {
                                                                label: curr.name,
                                                                value: curr.ID,
                                                            };
                                                            return acc;
                                                        }, {} as Record<string, { label: string; value: string }>)}
                                                        customSnapPoints={['50%', '70%']}
                                                        value={
                                                            accounts.find((acc) => acc.ID === value)
                                                                ?.name ?? ''
                                                        }
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
                                                style={{ fontFamily: 'InterMedium' }}
                                                className='text-xs text-red-500'
                                            >
                                                {errors.fromAccount.message}
                                            </Text>
                                        )}
                                    </>
                                </View>

                                <View>
                                    <Text
                                        style={{ fontFamily: 'InterBold' }}
                                        className='text-xs text-gray-600'
                                    >
                                        Credit Account
                                    </Text>
                                    <>
                                        <Controller
                                            control={control}
                                            rules={{
                                                required: "Credit account can't be empty",
                                            }}
                                            render={({ field: { onChange, value } }) => (
                                                <>
                                                    <SelectField
                                                        selectKey='newTransactionCreditAccount'
                                                        options={accounts.reduce((acc, curr) => {
                                                            acc[curr.ID] = {
                                                                label: curr.name,
                                                                value: curr.ID,
                                                            };
                                                            return acc;
                                                        }, {} as Record<string, { label: string; value: string }>)}
                                                        customSnapPoints={['50%', '70%']}
                                                        value={
                                                            accounts.find((acc) => acc.ID === value)
                                                                ?.name ?? ''
                                                        }
                                                        onChange={(val) => {
                                                            onChange(val);
                                                            setValue('fromAccount', val);
                                                        }}
                                                    />
                                                </>
                                            )}
                                            name='toAccount'
                                        />
                                        {errors.toAccount && (
                                            <Text
                                                style={{ fontFamily: 'InterMedium' }}
                                                className='text-xs text-red-500'
                                            >
                                                {errors.toAccount.message}
                                            </Text>
                                        )}
                                    </>
                                </View>
                            </View>
                        ) : (
                            <View>
                                <Text
                                    style={{ fontFamily: 'InterBold' }}
                                    className='text-xs text-gray-600'
                                >
                                    Account
                                </Text>
                                <>
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
                                                        acc[curr.ID] = {
                                                            label: curr.name,
                                                            value: curr.ID,
                                                        };
                                                        return acc;
                                                    }, {} as Record<string, { label: string; value: string }>)}
                                                    customSnapPoints={['50%', '70%']}
                                                    value={
                                                        accounts.find((acc) => acc.ID === value)
                                                            ?.name ?? ''
                                                    }
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
                                            style={{ fontFamily: 'InterMedium' }}
                                            className='text-xs text-red-500'
                                        >
                                            {errors.accountId.message}
                                        </Text>
                                    )}
                                </>
                            </View>
                        )
                    }

                    <View className='flex flex-col space-y-1'>
                        <Text style={{ fontFamily: 'InterBold' }} className='text-xs text-gray-600'>
                            Note
                        </Text>

                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <InputField
                                    className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                    style={GLOBAL_STYLESHEET.interSemiBold}
                                    cursorColor={'#8B5CF6'}
                                    placeholder='0.00'
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={value}
                                />
                            )}
                            name='note'
                        />
                        {errors.note && (
                            <Text
                                style={{ fontFamily: 'InterMedium' }}
                                className='text-xs text-red-500'
                            >
                                {errors.note.message}
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
                                Save
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>
            </SafeAreaView>
        </>
    );
}
