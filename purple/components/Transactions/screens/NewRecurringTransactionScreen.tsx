import { useAccountStore } from '@/components/Accounts/hooks';
import { ArrowLeftIcon } from '@/components/SVG/icons/24x24';
import { usePreferences } from '@/components/Settings/hooks';
import DatePicker from '@/components/Shared/atoms/DatePicker';
import SelectField from '@/components/Shared/atoms/SelectField';
import TimePicker from '@/components/Shared/atoms/TimePicker';
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
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { transformObject } from '@/lib/utils/object';
import { router, useLocalSearchParams } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ActivityIndicator, Keyboard, StatusBar as RNStatusBar } from 'react-native';
import Toast from 'react-native-toast-message';
import { useQueryClient } from 'react-query';
import {
    DAYS_OF_MONTH,
    DAYS_OF_WEEK,
    RECURRING_TRANSACTION_TYPES,
    TRANSACTION_RECURRENCE_RULES,
} from '../constants';
import { useCreateRecurringTransaction } from '../hooks';
import ScheduleSummary from '../molecules/ScheduleSummary';
import { generateICalRRule } from '../utils';

type FormData = {
    amount: string;
    category: string;
    note: string;
    type: string;
    accountId?: string;
    frequency: string;
    dayOfWeek?: string;
    dayOfMonth?: number;
    recurrence_rule: string;
    start_date?: string;
    end_date?: string;
    time: string;
};

export default function NewRecurringTransactionScreen() {
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
    const { mutate, isLoading } = useCreateRecurringTransaction();

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
            type: '',
            accountId: (accountId as string) ?? '',
            time: new Date().toISOString(),
            frequency: undefined,
            dayOfWeek: undefined,
            dayOfMonth: undefined,
            recurrence_rule: '',
            start_date: new Date().toISOString(),
            end_date: undefined,
        },
        // id,
        // created_at,
        // updated_at,
        // account_id,
        // type,
        // amount,
        // category,
        // recurrence_rule,
        // start_date,
        // end_date,
        // status,
        // metadata,
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

        const account = getAccountById(data.accountId);
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
            ['accountId', 'account_id'],
            ['amount', 'amount', (value) => Number(value)],
            ['recurrence_rule', 'recurrence_rule', () => rrule],
        ]);

        mutate(transformedData, {
            onError: (error) => {
                console.log('Error creating transaction:', error);
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
                                Recurring Transaction
                            </Text>
                        </View>
                    </View>

                    <View className='w-full bg-purple-100 rounded-full p-1.5 flex flex-row space-x-1.5'>
                        {RECURRING_TRANSACTION_TYPES.map((transaction) => {
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
                                        <Text style={satoshiFont.satoshiBlack} className='text-sm'>
                                            {transaction.label}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                    <ScheduleSummary
                        frequency={frequency as any}
                        dayOfMonth={dayOfMonth}
                        dayOfWeek={dayOfWeek}
                        time={time}
                    />
                    <View className='h-1 border-b border-purple-100 w-full' />
                </View>
                <ScrollView
                    className='space-y-5 flex-1 flex flex-col p-5'
                    contentContainerStyle={{
                        paddingBottom: 200,
                    }}
                >
                    {/* Amount */}
                    <View className='flex flex-col space-y-1'>
                        <Text style={satoshiFont.satoshiBold} className='text-xs text-gray-600'>
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
                                        style={satoshiFont.satoshiMedium}
                                        cursorColor={'#8B5CF6'}
                                        placeholder='0.00'
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        value={value !== undefined ? String(value) : undefined}
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

                    {/* Category */}
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
                                    <SelectField
                                        selectKey='newRecurringTransactionCategory'
                                        options={transactionTypes.reduce((acc, curr) => {
                                            acc[curr] = {
                                                label: curr,
                                                value: curr,
                                            };
                                            return acc;
                                        }, {} as Record<string, { label: string; value: string }>)}
                                        customSnapPoints={['50%', '70%']}
                                        value={value !== undefined ? String(value) : undefined}
                                        onChange={onChange}
                                    />
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

                    {/* Account */}
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
                                    <SelectField
                                        selectKey='newRecurringTransactionAccount'
                                        options={accounts.reduce((acc, curr) => {
                                            acc[curr.id] = {
                                                label: curr.name,
                                                value: curr.id,
                                            };
                                            return acc;
                                        }, {} as Record<string, { label: string; value: string }>)}
                                        customSnapPoints={['50%', '70%']}
                                        value={value !== undefined ? String(value) : undefined}
                                        onChange={(val) => {
                                            onChange(val);
                                            setValue('accountId', val);
                                        }}
                                    />
                                )}
                                name='accountId'
                            />
                            {errors.accountId && (
                                <Text
                                    style={satoshiFont.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.accountId.message}
                                </Text>
                            )}
                        </View>
                    </View>

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
                                        options={TRANSACTION_RECURRENCE_RULES.reduce(
                                            (acc, curr) => {
                                                acc[curr.value] = {
                                                    label: curr.label,
                                                    value: curr.value,
                                                };
                                                return acc;
                                            },
                                            {} as Record<string, { label: string; value: string }>,
                                        )}
                                        customSnapPoints={['50%', '70%']}
                                        value={value !== undefined ? String(value) : undefined}
                                        onChange={onChange}
                                    />
                                )}
                                name='frequency'
                            />
                            {errors.frequency && (
                                <Text
                                    style={satoshiFont.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.frequency.message}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Time picker - always shown */}
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
                            <Text
                                style={satoshiFont.satoshiMedium}
                                className='text-xs text-red-500'
                            >
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
                                <Text
                                    style={satoshiFont.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
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
                                <Text
                                    style={satoshiFont.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
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
                                        // format "2006-01-02T15:04:05.000Z"
                                        onChange(date.toISOString());
                                    }}
                                    // selectedDate={value}
                                    // make maximim date today
                                    maximumDate={new Date()}
                                    value={new Date(value)}
                                />
                            )}
                            name='start_date'
                        />
                        {errors.start_date && (
                            <Text
                                style={satoshiFont.satoshiMedium}
                                className='text-xs text-red-500'
                            >
                                {errors.start_date.message}
                            </Text>
                        )}
                    </View>

                    <View className='flex flex-col space-y-1'>
                        <Controller
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <DatePicker
                                    label='End Date'
                                    pickerKey='newTransactionStartDate'
                                    onChange={(date) => {
                                        // format "2006-01-02T15:04:05.000Z"
                                        onChange(date.toISOString());
                                    }}
                                    // selectedDate={value}
                                    // make maximim date today
                                    value={new Date(value)}
                                />
                            )}
                            name='end_date'
                        />
                        {errors.end_date && (
                            <Text
                                style={satoshiFont.satoshiMedium}
                                className='text-xs text-red-500'
                            >
                                {errors.end_date.message}
                            </Text>
                        )}
                    </View>

                    <View className='h-1 border-b border-purple-100 w-full' />

                    {/* Note */}
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
