import { useAccountStore } from '@/components/Accounts/hooks';
import { ArrowLeftIcon } from '@/components/SVG/icons/24x24';
import { usePreferences } from '@/components/Settings/hooks';
import DatePicker from '@/components/Shared/atoms/DatePicker';
import SelectField from '@/components/Shared/atoms/SelectField';
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
import { useTransactionStore, useEditRecurringTransaction } from '../hooks';
import ScheduleSummary from '../molecules/ScheduleSummary';
import { generateICalRRule, getMinimumEndDate } from '../utils';
import HTTPError from '@/lib/utils/error';
import { RRule } from 'rrule';
import { isNotEmptyString } from '@/lib/utils/string';

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

export default function EditRecurringTransactionScreen() {
    const { type } = useLocalSearchParams();
    const {
        preferences: { customTransactionTypes },
    } = usePreferences();
    const queryClient = useQueryClient();
    const { accounts, getAccountById } = useAccountStore();
    const { logEvent } = useAnalytics();
    const { currentRecurringTransaction } = useTransactionStore();
    const [transactionType, setTransactionType] = useState<string>(
        currentRecurringTransaction?.type ?? (type as string) ?? 'debit',
    );
    const { mutate: editRecurringTransaction, isLoading } = useEditRecurringTransaction();

    // Parse the existing recurrence rule to populate form fields
    const parsedRecurrence = useMemo(() => {
        if (currentRecurringTransaction?.recurrence_rule) {
            const parsedRule = RRule.fromString(currentRecurringTransaction.recurrence_rule);
            return {
                frequency: RRule.FREQUENCIES[parsedRule.options.freq],
                dayOfWeek: parsedRule.options.byweekday
                    ? DAYS_OF_WEEK.find(
                          (d) => d.value === parsedRule.options.byweekday[0]?.toString(),
                      )?.label
                    : undefined,
                dayOfMonth: parsedRule.options.bymonthday
                    ? parsedRule.options.bymonthday[0]
                    : undefined,
                time: parsedRule.options.dtstart
                    ? parsedRule.options.dtstart.toISOString()
                    : new Date().toISOString(),
            };
        }
        return {
            frequency: 'daily',
            dayOfWeek: undefined,
            dayOfMonth: undefined,
            time: new Date().toISOString(),
        };
    }, [currentRecurringTransaction?.recurrence_rule]);

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<FormData>({
        defaultValues: {
            amount: currentRecurringTransaction?.amount.toString() ?? '',
            category: currentRecurringTransaction?.category ?? '',
            fromAccount: currentRecurringTransaction?.from_account ?? '',
            toAccount: currentRecurringTransaction?.to_account ?? '',
            type: currentRecurringTransaction?.type ?? transactionType,
            accountId: currentRecurringTransaction?.account_id ?? '',
            frequency: parsedRecurrence.frequency.toLowerCase(),
            dayOfWeek: parsedRecurrence.dayOfWeek,
            dayOfMonth: parsedRecurrence.dayOfMonth,
            recurrence_rule: currentRecurringTransaction?.recurrence_rule ?? '',
            start_date: currentRecurringTransaction?.start_date,
            end_date: currentRecurringTransaction?.end_date ?? undefined,
            time: parsedRecurrence.time,
            note: currentRecurringTransaction?.notes ?? '',
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
            screen: 'edit_recurring_transaction_screen',
            log: 'attempting to edit recurring transaction',
            data,
        });
        Keyboard.dismiss();

        if (!currentRecurringTransaction?.id) {
            Toast.show({
                type: 'error',
                props: { text1: 'Error!', text2: 'No transaction to edit' },
            });
            return;
        }

        const accountId = transactionType !== 'transfer' ? data.accountId : data.fromAccount;
        const account = getAccountById(accountId);
        if (!account) {
            await logEvent('error_occurred', {
                error_type: 'NOT_FOUND_ERROR',
                context: `Account with id ${accountId} not found`,
                severity: 'high',
            });
            Toast.show({
                type: 'error',
                props: { text1: 'Error!', text2: "Couldn't find account" },
            });
            return;
        }

        if (transactionType === 'transfer' && data.fromAccount === data.toAccount) {
            Toast.show({
                type: 'warning',
                props: { text1: 'Oops!', text2: 'Cannot transfer to same account' },
            });
            return;
        }

        // Generate new recurrence rule
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
            [
                'note',
                'notes',
                (value) => (value && isNotEmptyString(value as string | undefined) ? value : null),
            ],
            ['type', 'type', () => transactionType as 'debit' | 'credit' | 'transfer'],
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

        editRecurringTransaction(
            { id: currentRecurringTransaction.id, data: transformedData },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries(['recurring-transactions']);
                    Toast.show({
                        type: 'success',
                        props: {
                            text1: 'Success!',
                            text2: 'Recurring transaction updated successfully',
                        },
                    });
                    router.back();
                },
                onError: (error: any) => {
                    if (error instanceof HTTPError) {
                        Toast.show({
                            type: 'error',
                            props: { text1: 'Error!', text2: error.message },
                        });
                        return;
                    }
                    Toast.show({
                        type: 'error',
                        props: { text1: 'Error!', text2: "Couldn't update recurring transaction" },
                    });
                    console.error('Error updating recurring transaction:', error);
                },
            },
        );
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
                                            }, {} as Record<string, { label: string; value: string }>)}
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
                                Edit Recurring Transaction
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
                    <ScheduleSummary
                        frequency={frequency as any}
                        dayOfMonth={dayOfMonth}
                        dayOfWeek={dayOfWeek}
                        time={time}
                    />

                    <View className='bg-purple-50 border border-purple-100 rounded-3xl w-full mt-2.5 flex flex-col'>
                        <View className='flex flex-row items-center p-3'>
                            <Text
                                style={satoshiFont.satoshiBold}
                                className='text-xs text-purple-600'
                            >
                                Editing this transaction will only affect future occurrences.
                            </Text>
                        </View>
                    </View>

                    <View className='h-1 border-b border-purple-100 w-full' />
                </View>
                <ScrollView
                    className='space-y-5 flex-1 flex flex-col p-5'
                    contentContainerStyle={{
                        paddingBottom: 200,
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

                    {renderAccountFields()}

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

                    <View className='h-1 border-b border-purple-100 w-full' />
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
                                            Update
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
