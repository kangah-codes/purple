import { useAccounts } from '@/components/Accounts/hooks';
import { useBudgetForMonth } from '@/components/Plans/hooks';
import { ArrowLeftIcon } from '@/components/SVG/icons/24x24';
import { usePreferences } from '@/components/Settings/hooks';
import DateAndTimePicker from '@/components/Shared/atoms/DateAndTimePicker';
import DatePicker from '@/components/Shared/atoms/DatePicker';
import SearchableSelectField, {
    SelectOption,
} from '@/components/Shared/atoms/SearchableSelectField';
import SelectField from '@/components/Shared/atoms/SelectField';
import Switch from '@/components/Shared/atoms/Switch';
import TimePicker from '@/components/Shared/atoms/TimePicker';
import FlagIcon from '@/components/Shared/atoms/FlagIcon';
import CurrencySelect from '@/components/Shared/molecules/CurrencySelect';
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
import { currencies } from '@/lib/constants/currencies';
import { satoshiFont } from '@/lib/constants/fonts';
import { TRANSACTION_TYPES } from '@/lib/constants/transactionTypes';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { omit, transformObject } from '@/lib/utils/object';
import { router, useLocalSearchParams } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar as RNStatusBar,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useQueryClient } from 'react-query';
import { DAYS_OF_MONTH, DAYS_OF_WEEK, TRANSACTION_RECURRENCE_RULES } from '../constants';
import { useCreateRecurringTransaction, useCreateTransaction } from '../hooks';
import ScheduleSummary from '../molecules/ScheduleSummary';
import { generateICalRRule, getMinimumEndDate } from '../utils';
import HTTPError from '@/lib/utils/error';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';

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
    currency: string;
};

export default function NewTransactionScreen() {
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();
    const { type, accountId, isRecurringTx } = useLocalSearchParams();
    const {
        preferences: { customTransactionTypes, currency: defaultCurrency },
    } = usePreferences();
    const queryClient = useQueryClient();
    const { logEvent } = useAnalytics();
    const [transactionType, setTransactionType] = useState<string>((type as string) ?? 'debit');
    const [isRecurring, setIsRecurring] = useState(Boolean(isRecurringTx));
    const [countInBudget, setCountInBudget] = useState(true);
    const { mutate: createTransaction, isLoading: isCreatingTransaction } = useCreateTransaction();
    const { mutate: createRecurringTransaction, isLoading: isCreatingRecurring } =
        useCreateRecurringTransaction();
    const { data } = useAccounts({
        requestQuery: {},
    });
    const isLoading = isCreatingTransaction || isCreatingRecurring;
    const accounts = data?.data || [];
    const accountsToUse = accounts
        .filter((a) => a.is_open)
        .reduce((acc, curr) => {
            acc[curr.id] = {
                label: curr.name,
                value: curr.id,
            };
            return acc;
        }, {} as Record<string, { label: string; value: string }>);

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
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
            currency: defaultCurrency,
        },
    });

    const setAccountCurrency = useCallback(
        (accountId: string) => {
            const account = accounts.find((a) => a.id === accountId);
            if (account) {
                setValue('currency', account.currency);
            }
        },
        [accounts, setValue],
    );

    // Auto-select currency when screen opens with a pre-selected account
    useEffect(() => {
        if (accountId && accounts.length > 0) {
            setAccountCurrency(accountId as string);
        }
    }, [accountId, accounts, setAccountCurrency]);

    const transactionTypes = useMemo(
        () =>
            customTransactionTypes.map(
                (transaction) => `${transaction.emoji} ${transaction.category}`,
            ),
        [customTransactionTypes],
    );

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
                    setShowBottomSheetFlatList('newTransactionCurrency', false);
                }}
                selectedCurrency={selectedValue}
            />
        );
    }, [getValues, setValue, setShowBottomSheetFlatList]);

    useEffect(() => {
        setValue('type', transactionType);
    }, [transactionType, setValue]);

    const frequency = useWatch({
        control,
        name: 'frequency',
        defaultValue: '',
    });

    const startDate = useWatch({
        control,
        name: 'start_date',
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

    // Watch the transaction date to determine which budget to use
    const transactionDateISO = useWatch({
        control,
        name: 'date',
        defaultValue: new Date().toISOString(),
    });

    // Get the month and year from the transaction date for budget lookup
    const transactionDate = transactionDateISO ? new Date(transactionDateISO) : new Date();
    const transactionMonth = transactionDate.getMonth() + 1; // 1-indexed
    const transactionYear = transactionDate.getFullYear();

    // Fetch the budget for the transaction's month/year
    const { data: budgetData } = useBudgetForMonth(transactionMonth, transactionYear);
    const budgetForMonth = budgetData?.data;

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
        const account = accounts.find((acc) => acc.id === accountId);
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
                ['accountId', 'account_id', (value) => (value ? value : data.fromAccount)],
                ['amount', 'amount', (value) => Number(value)],
                ['charges', 'charges', (value) => Number(value)],
                ['recurrence_rule', 'recurrence_rule', () => rrule],
                ['note', 'notes', (value) => value ?? null],
            ]);

            const shouldCountInBudget = Boolean(
                transactionType === 'debit' && budgetForMonth && countInBudget,
            );

            transformedData = {
                ...transformedData,
                metadata: {
                    ...(transformedData as any).metadata,
                    count_in_budget: shouldCountInBudget,
                },
            };

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
                    console.error(
                        '[NewRecurringTransactionScreen] Error creating transaction:',
                        error,
                    );
                    if (error instanceof HTTPError) {
                        Toast.show({
                            type: 'error',
                            props: { text1: 'Error!', text2: error.message },
                        });
                        return;
                    }
                    Toast.show({
                        type: 'error',
                        props: { text1: 'Error!', text2: "Couldn't create transaction" },
                    });
                    console.error('Error creating recurring transaction:', error);
                },
            });
        } else {
            // Handle regular transaction creation
            // Determine budget_id based on countInBudget toggle and if budget exists for the month
            const budgetId = countInBudget && budgetForMonth ? budgetForMonth.id : null;

            let transformedData = transformObject(data, [
                ['toAccount', 'to_account'],
                ['fromAccount', 'from_account'],
                ['accountId', 'account_id', (value) => (value ? value : data.fromAccount)],
                ['amount', 'amount', (value) => Number(value)],
                ['charges', 'charges', (value) => Number(value)],
            ]);

            // Add budget_id to the transaction data
            transformedData = {
                ...transformedData,
                budget_id: budgetId ?? undefined,
            };

            if (transactionType !== 'transfer') {
                transformedData = omit(transformedData, [
                    'from_account',
                    'to_account',
                ]) as typeof transformedData;
            }

            createTransaction(transformedData, {
                onError: (err) => {
                    if (err instanceof HTTPError) {
                        Toast.show({
                            type: 'error',
                            props: { text1: 'Error!', text2: err.message },
                        });
                        return;
                    }
                    Toast.show({
                        type: 'error',
                        props: { text1: 'Error!', text2: "Couldn't create transaction" },
                    });
                },
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['transactions', 'accounts'] });
                    // Also invalidate budget queries to reflect updated spent amounts
                    if (budgetId) {
                        queryClient.invalidateQueries({ queryKey: ['budget'] });
                        queryClient.invalidateQueries({ queryKey: ['budget-earned-income'] });
                    }
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
                                            options={accountsToUse}
                                            customSnapPoints={['50%', '70%']}
                                            value={value}
                                            onChange={(val) => {
                                                onChange(val);
                                                setValue('fromAccount', val);
                                                setAccountCurrency(val);
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
                                            options={accountsToUse}
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
                                    options={accountsToUse}
                                    customSnapPoints={['50%', '70%']}
                                    value={value}
                                    onChange={(val) => {
                                        onChange(val);
                                        setValue('accountId', val);
                                        setAccountCurrency(val);
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
                                    // update end date to be at least the minimum end date based on frequency and new start date
                                    // setValue(
                                    //     'end_date',
                                    //     getMinimumEndDate(
                                    //         frequency,
                                    //         date.toISOString(),
                                    //     ).toISOString(),
                                    // );
                                }}
                                // minimumDate={new Date()}
                                value={value}
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

                <View className='flex flex-col space-y-1'>
                    <Controller
                        control={control}
                        // rules={{
                        //     required: "Date can't be empty",
                        // }}
                        render={({ field: { onChange, value } }) => (
                            <DatePicker
                                label='End Date'
                                pickerKey='newTransactionEndDate'
                                onChange={(date) => {
                                    onChange(date.toISOString());
                                }}
                                minimumDate={getMinimumEndDate(frequency, startDate)}
                                value={value}
                            />
                        )}
                        name='end_date'
                    />
                    {errors.end_date && (
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-red-500'>
                            {errors.end_date.message}
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
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps='handled'
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
                                                selectKey='newTransactionCurrency'
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
                                            <SearchableSelectField
                                                selectKey='newTransactionCategory'
                                                options={transactionTypes.reduce((acc, curr) => {
                                                    acc[curr] = {
                                                        label: curr,
                                                        value: curr,
                                                        searchField: curr,
                                                    };
                                                    return acc;
                                                }, {} as Record<string, { label: string; value: string; searchField: string }>)}
                                                customSnapPoints={['50%', '70%']}
                                                value={value}
                                                onChange={onChange}
                                                renderFooter={() => (
                                                    <View className='my-5'>
                                                        <TouchableOpacity
                                                            style={{ width: '100%' }}
                                                            onPress={() => {
                                                                router.push(
                                                                    '/settings/new-transaction-category',
                                                                );
                                                                setShowBottomSheetFlatList(
                                                                    'newTransactionCategory',
                                                                    false,
                                                                );
                                                            }}
                                                            disabled={isLoading}
                                                        >
                                                            <LinearGradient
                                                                className='flex items-center justify-center rounded-full px-5 h-[50]'
                                                                colors={['#c084fc', '#9333ea']}
                                                                style={{ width: '100%' }}
                                                            >
                                                                <Text
                                                                    style={satoshiFont.satoshiBlack}
                                                                    className='text-white text-center'
                                                                >
                                                                    New Category
                                                                </Text>
                                                            </LinearGradient>
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
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
                                            returnKeyType='done'
                                            onSubmitEditing={Keyboard.dismiss}
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

                        {/* Budget Toggle - only show for expense (debit) transactions and when budget exists */}
                        {transactionType === 'debit' && budgetForMonth && (
                            <View className='flex flex-col space-y-1 mb-20'>
                                <View className='flex flex-row w-full justify-between items-center'>
                                    <Text
                                        style={satoshiFont.satoshiBold}
                                        className='text-xs text-gray-600'
                                    >
                                        Count in budget
                                    </Text>

                                    <View>
                                        <Switch
                                            value={countInBudget}
                                            onValueChange={setCountInBudget}
                                            disabled={!budgetForMonth}
                                        />
                                    </View>
                                </View>
                            </View>
                        )}
                        {transactionType !== 'debit' && <View className='mb-20' />}
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
