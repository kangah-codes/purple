import { useAccountStore } from '@/components/Accounts/hooks';
import { ArrowLeftIcon } from '@/components/SVG/icons/24x24';
import { usePreferences } from '@/components/Settings/hooks';
import DateAndTimePicker from '@/components/Shared/atoms/DateAndTimePicker';
import DatePicker from '@/components/Shared/atoms/DatePicker';
import SelectField from '@/components/Shared/atoms/SelectField';
import Switch from '@/components/Shared/atoms/Switch';
import TimePicker from '@/components/Shared/atoms/TimePicker';
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
import { TRANSACTION_TYPES } from '@/lib/constants/transactionTypes';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { omit, transformObject } from '@/lib/utils/object';
import { router, useLocalSearchParams } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ActivityIndicator, Keyboard, StatusBar as RNStatusBar } from 'react-native';
import Toast from 'react-native-toast-message';
import { useQueryClient } from 'react-query';
import { DAYS_OF_MONTH, DAYS_OF_WEEK, TRANSACTION_RECURRENCE_RULES } from '../constants';
import { useCreateRecurringTransaction, useCreateTransaction } from '../hooks';
import ScheduleSummary from '../molecules/ScheduleSummary';
import { generateICalRRule } from '../utils';

type FormData = {
    amount: string;
    category: string;
    note: string;
    fromAccount?: string;
    toAccount?: string;
    type: string;
    accountId?: string;
    date: string;
    charges: string;
    time: string;
    frequency?: string;
    dayOfWeek?: string;
    dayOfMonth?: number;
    recurrence_rule: string;
    start_date?: string;
    end_date?: string;
};

export default function NewTransactionScreen() {
    const { type, accountId } = useLocalSearchParams();
    const {
        preferences: { customTransactionTypes },
    } = usePreferences();
    const queryClient = useQueryClient();
    const { accounts, getAccountById } = useAccountStore();
    const { logEvent } = useAnalytics();
    const {
        preferences: { allowOverdraw },
    } = usePreferences();
    const [transactionType, setTransactionType] = useState<string>((type as string) ?? 'debit');
    const [isRecurring, setIsRecurring] = useState(false);
    const { mutate: createTransaction, isLoading: isCreatingTransaction } = useCreateTransaction();
    const { mutate: createRecurringTransaction, isLoading: isCreatingRecurring } =
        useCreateRecurringTransaction();

    const isLoading = isCreatingTransaction || isCreatingRecurring;

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<FormData>({
        defaultValues: {
            amount: '',
            category: '',
            note: '',
            fromAccount: type == 'transfer' ? (accountId as string) ?? '' : '',
            toAccount: '',
            type: '',
            accountId: (accountId as string) ?? '',
            date: new Date().toISOString(),
            charges: '',
            time: new Date().toISOString(),
            frequency: undefined,
            dayOfWeek: undefined,
            dayOfMonth: undefined,
            recurrence_rule: '',
            start_date: new Date().toISOString(),
            end_date: undefined,
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

    const frequency = useWatch({
        control,
        name: 'frequency',
        defaultValue: '',
    });

    const dateISO = useWatch({
        control,
        name: 'time',
        defaultValue: new Date().toISOString(),
    });

    const selectedDayOfWeek = useWatch({
        control,
        name: 'dayOfWeek',
    });

    const selectedDayOfMonth = useWatch({
        control,
        name: 'dayOfMonth',
    });

    const date = dateISO ? new Date(dateISO) : new Date();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dayOfMonth = frequency === 'monthly' ? selectedDayOfMonth : undefined;
    const dayOfWeek =
        frequency === 'weekly'
            ? DAYS_OF_WEEK.find((d) => d.value === selectedDayOfWeek)?.label
            : undefined;

    const onSubmit = async (data: FormData) => {
        await logEvent('button_tap', {
            button: 'submit',
            screen: 'new_transactiont_screen',
            log: 'attempting to create transaction',
            data,
        });
        Keyboard.dismiss();

        const accountId = transactionType !== 'transfer' ? data.accountId : data.fromAccount;
        // check if overdraw is allowed
        const account = getAccountById(accountId);
        if (!account) {
            await logEvent('error_occurred', {
                error_type: 'NOT_FOUND_ERROR',
                context: `Account with id ${accountId} not found`,
                severity: 'high',
            });
            Toast.show({
                type: 'error',
                props: { text1: 'Error!', text2: "Couldn't create transaction" },
            });
            return;
        }

        if (transactionType == 'transfer' && data.fromAccount === data.toAccount) {
            Toast.show({
                type: 'warning',
                props: { text1: 'Oops!', text2: 'Cannot transfer to same account' },
            });
            return;
        }

        if (
            account.balance - Number(data.amount) < 0 &&
            !allowOverdraw &&
            ['debit', 'transfer'].includes(transactionType) &&
            !isRecurring
        ) {
            await logEvent('generic_event', {
                context: 'attempted to overdraw account',
            });
            Toast.show({
                type: 'warning',
                props: { text1: 'Oops!', text2: 'Cannot overdraw account!' },
            });
            return;
        }

        if (isRecurring) {
            // Handle recurring transaction creation
            const timeString = new Date(data.time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });

            const rrule = generateICalRRule(
                data.frequency as 'daily' | 'weekly' | 'monthly',
                data.dayOfWeek,
                data.dayOfMonth ? Number(data.dayOfMonth) : undefined,
                timeString,
            );

            let transformedData = transformObject(data, [
                ['toAccount', 'to_account'],
                ['fromAccount', 'from_account'],
                ['accountId', 'account_id', (value) => (Boolean(value) ? value : data.fromAccount)],
                ['amount', 'amount', (value) => Number(value)],
                ['charges', 'charges', (value) => Number(value)],
                ['recurrence_rule', 'recurrence_rule', () => rrule],
            ]);

            // For transfers, ensure both from_account and to_account are included
            if (transactionType === 'transfer') {
                transformedData = {
                    ...transformedData,
                    from_account: data.fromAccount,
                    to_account: data.toAccount,
                };
            } else {
                // Remove transfer-specific fields for non-transfer transactions
                transformedData = omit(transformedData, [
                    'from_account',
                    'to_account',
                ]) as typeof transformedData;
            }

            createRecurringTransaction(transformedData, {
                onSuccess: () => {
                    queryClient.invalidateQueries(['recurring-transactions']);
                    router.back();
                },
                onError: (error) => {
                    console.error('Error creating recurring transaction:', error);
                },
            });
        } else {
            // Handle regular transaction creation
            let transformedData = transformObject(data, [
                ['toAccount', 'to_account'],
                ['fromAccount', 'from_account'],
                ['accountId', 'account_id', (value) => (Boolean(value) ? value : data.fromAccount)],
                ['amount', 'amount', (value) => Number(value)],
                ['charges', 'charges', (value) => Number(value)],
            ]);

            if (transactionType !== 'transfer') {
                transformedData = omit(transformedData, [
                    'from_account',
                    'to_account',
                ]) as typeof transformedData;
            }

            createTransaction(transformedData, {
                onError: () => {
                    Toast.show({
                        type: 'error',
                        props: { text1: 'Error!', text2: "Couldn't create transaction" },
                    });
                },
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['transactions', 'accounts'] });
                    Toast.show({
                        type: 'success',
                        props: { text1: 'Success!', text2: 'Transaction created successfully' },
                    });
                    router.back();
                },
            });
        }
    };

    const renderAccountFields = () => {
        if (transactionType === 'transfer') {
            return (
                <View className='flex flex-col space-y-5'>
                    <View className='flex flex-col space-y-1'>
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
                            From Account
                        </Text>
                        <View>
                            <Controller
                                control={control}
                                rules={{
                                    required: "From account can't be empty",
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <SelectField
                                            selectKey='newTransactionDebitAccount'
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
                                                setValue('fromAccount', val);
                                            }}
                                        />
                                    </>
                                )}
                                name='fromAccount'
                            />
                            {errors.fromAccount && (
                                <Text
                                    style={satoshiFont.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.fromAccount.message}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View className='flex flex-col space-y-1'>
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
                            To Account
                        </Text>
                        <View>
                            <Controller
                                control={control}
                                rules={{
                                    required: "To account can't be empty",
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <SelectField
                                            selectKey='newTransactionCreditAccount'
                                            options={accounts.reduce((acc, curr) => {
                                                acc[curr.id] = {
                                                    label: curr.name,
                                                    value: curr.id,
                                                };
                                                return acc;
                                            }, {} as Record<string, string>)}
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
                                    style={satoshiFont.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.toAccount.message}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View className='flex flex-col space-y-1'>
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
                            Charges
                        </Text>
                        <View>
                            <Controller
                                control={control}
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
                                name='charges'
                            />
                            {errors.charges && (
                                <Text
                                    style={satoshiFont.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.charges.message}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            );
        }
        return (
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
                                        setValue('accountId', val);
                                    }}
                                />
                            </>
                        )}
                        name='accountId'
                    />
                    {errors.accountId && (
                        <Text style={satoshiFont.satoshiMedium} className='text-xs text-red-500'>
                            {errors.accountId.message}
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    const renderRecurringFields = () => {
        if (!isRecurring) return null;

        return (
            <View className='space-y-5'>
                <View className='h-1 border-b border-purple-100 w-full' />

                {/* Frequency */}
                <View className='flex flex-col space-y-1'>
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
                        Frequency
                    </Text>
                    <View>
                        <Controller
                            control={control}
                            rules={{
                                required: "Frequency can't be empty",
                            }}
                            render={({ field: { onChange, value } }) => (
                                <SelectField
                                    selectKey='transactionRecurrenceRule'
                                    options={TRANSACTION_RECURRENCE_RULES.reduce((acc, curr) => {
                                        acc[curr.value] = {
                                            label: curr.label,
                                            value: curr.value,
                                        };
                                        return acc;
                                    }, {} as Record<string, { label: string; value: string }>)}
                                    customSnapPoints={['50%', '70%']}
                                    value={value !== undefined ? String(value) : undefined}
                                    onChange={onChange}
                                />
                            )}
                            name='frequency'
                        />
                        {errors.frequency && (
                            <Text style={satoshiFont.satoshiBold} className='text-xs text-red-500'>
                                {errors.frequency.message}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Time picker - always shown for recurring */}
                <View className='flex flex-col space-y-1'>
                    <Controller
                        control={control}
                        rules={{
                            required: "Time can't be empty",
                        }}
                        render={({ field: { onChange, value } }) => (
                            <TimePicker
                                label='Time'
                                pickerKey='newRecurringTransactionTime'
                                onChange={(date) => {
                                    onChange(date.toISOString());
                                }}
                                value={new Date(value)}
                            />
                        )}
                        name='time'
                    />
                    {errors.time && (
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-red-500'>
                            {errors.time.message}
                        </Text>
                    )}
                </View>

                {/* Conditional fields based on frequency */}
                {frequency === 'weekly' && (
                    <View className='flex flex-col space-y-1'>
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
                            Day of Week
                        </Text>
                        <View>
                            <Controller
                                control={control}
                                rules={{
                                    required: 'Please select a day of the week',
                                }}
                                name='dayOfWeek'
                                render={({ field: { onChange, value } }) => (
                                    <SelectField
                                        selectKey='dayOfWeekSelect'
                                        options={DAYS_OF_WEEK.reduce((acc, curr) => {
                                            acc[curr.value] = {
                                                label: curr.label,
                                                value: curr.value,
                                            };
                                            return acc;
                                        }, {} as Record<string, { label: string; value: string }>)}
                                        customSnapPoints={['50%', '70%']}
                                        value={value !== undefined ? String(value) : undefined}
                                        onChange={onChange}
                                    />
                                )}
                            />
                        </View>
                        {errors.dayOfWeek && (
                            <Text style={satoshiFont.satoshiBold} className='text-xs text-red-500'>
                                {errors.dayOfWeek.message}
                            </Text>
                        )}
                    </View>
                )}

                {frequency === 'monthly' && (
                    <View className='flex flex-col space-y-1'>
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
                            Day of Month
                        </Text>
                        <View>
                            <Controller
                                control={control}
                                rules={{
                                    required: 'Please select a day of the month',
                                }}
                                name='dayOfMonth'
                                render={({ field: { onChange, value } }) => (
                                    <SelectField
                                        selectKey='dayOfMonthSelect'
                                        options={DAYS_OF_MONTH.reduce((acc, curr) => {
                                            acc[curr.value] = {
                                                label: curr.label,
                                                value: curr.value,
                                            };
                                            return acc;
                                        }, {} as Record<string, { label: string; value: string }>)}
                                        customSnapPoints={['50%', '70%']}
                                        value={value !== undefined ? String(value) : undefined}
                                        onChange={onChange}
                                    />
                                )}
                            />
                        </View>
                        {errors.dayOfMonth && (
                            <Text style={satoshiFont.satoshiBold} className='text-xs text-red-500'>
                                {errors.dayOfMonth.message}
                            </Text>
                        )}
                    </View>
                )}

                <View className='flex flex-col space-y-1'>
                    <Controller
                        control={control}
                        rules={{
                            required: "Date can't be empty",
                        }}
                        render={({ field: { onChange, value } }) => (
                            <DatePicker
                                label='Start Date'
                                pickerKey='newTransactionStartDate'
                                onChange={(date) => {
                                    onChange(date.toISOString());
                                }}
                                minimumDate={new Date()}
                                value={new Date(value)}
                            />
                        )}
                        name='start_date'
                    />
                    {errors.start_date && (
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-red-500'>
                            {errors.start_date.message}
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
                    <View className='w-full flex flex-row py-2.5 justify-between items-center relative'>
                        <TouchableOpacity
                            onPress={router.back}
                            className='bg-purple-100 px-4 py-2 flex items-center justify-center rounded-full'
                        >
                            <ArrowLeftIcon stroke='#9333EA' strokeWidth={2.5} />
                        </TouchableOpacity>

                        <View className='absolute left-0 right-0 items-center'>
                            <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                                New Transaction
                            </Text>
                        </View>
                    </View>
                    <View className='w-full'>
                        <AnimatedPillSelect<string>
                            options={TRANSACTION_TYPES.map((t) => ({
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

                    {/* Schedule Summary for recurring transactions */}
                    {isRecurring && (
                        <ScheduleSummary
                            frequency={frequency as any}
                            dayOfMonth={dayOfMonth}
                            dayOfWeek={dayOfWeek}
                            time={time}
                        />
                    )}

                    <View className='h-1 border-b border-purple-100 w-full' />
                </View>
                <ScrollView
                    className='space-y-5 flex-1 flex flex-col p-5'
                    contentContainerStyle={{
                        paddingBottom: 100,
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

                    {/* Date picker - only for non-recurring transactions */}
                    {!isRecurring && (
                        <View className='space-y-5'>
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
                                                onChange(date.toISOString());
                                            }}
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
                        </View>
                    )}

                    <View className='h-1 border-b border-purple-100 w-full' />

                    {renderAccountFields()}

                    <View className='h-1 border-b border-purple-100 w-full' />

                    {/* Recurring Transaction Toggle */}
                    <View className='flex flex-row w-full justify-between items-center'>
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
                            Repeat Transaction
                        </Text>

                        <View>
                            <Switch value={isRecurring} onValueChange={setIsRecurring} />
                        </View>
                    </View>

                    {/* Recurring transaction fields */}
                    {renderRecurringFields()}

                    <View className='h-1 border-b border-purple-100 w-full' />

                    <View className='flex flex-col space-y-1 mb-20'>
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
                                Save
                            </Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </SafeAreaView>
        </>
    );
}
