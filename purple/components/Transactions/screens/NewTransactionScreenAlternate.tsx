import { useAccountStore } from '@/components/Accounts/hooks';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/SVG/icons/24x24';
import { usePreferences } from '@/components/Settings/hooks';
import DateAndTimePicker from '@/components/Shared/atoms/DateAndTimePicker';
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
import { satoshiFont } from '@/lib/constants/fonts';
import { TRANSACTION_TYPES } from '@/lib/constants/transactionTypes';
import { omit, transformObject } from '@/lib/utils/object';
import { router, useLocalSearchParams } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Keyboard, StatusBar as RNStatusBar } from 'react-native';
import Toast from 'react-native-toast-message';
import { useQueryClient } from 'react-query';
import { useCreateTransaction } from '../hooks';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { CoinSwapIcon } from '@/components/SVG/icons/noscale';
import { ChevronRightIcon } from '@/components/SVG/icons/16x16';
import { AnimatedPillSelect } from '@/components/Shared/molecules/AnimatedPillSelect';
import NewTransactionNumberInput from '../molecules/NewTransactionNumberInput';

export default function NewTransactionScreenAlternate() {
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
    const { mutate, isLoading } = useCreateTransaction();
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
            fromAccount: type == 'transfer' ? (accountId as string) ?? '' : '',
            toAccount: '',
            type: '',
            accountId: (accountId as string) ?? '',
            date: new Date().toISOString(),
            charges: '',
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

    const onSubmit = async (data: {
        amount: string;
        category: string;
        note: string;
        fromAccount?: string;
        toAccount?: string;
        type: string;
        accountId?: string;
        date: string;
        charges: string;
    }) => {
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
            ['debit', 'transfer'].includes(transactionType)
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
            ]) as typeof transformedData; // looks hacky af
        }

        mutate(transformedData, {
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

    return (
        <SafeAreaView className='bg-white flex-1' style={{ paddingTop: RNStatusBar.currentHeight }}>
            <ExpoStatusBar style='dark' />

            {/* Header */}
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

            {/* Content + Footer */}
            <View className='flex-1 flex flex-col'>
                {/* Fills all available space */}
                <ScrollView className='flex-1 flex flex-col bg-purple-50'>
                    {Array.from({ length: 200 }).map((_, i) => (
                        <Text key={i} className='text-black'>
                            LOL {i + 1}
                        </Text>
                    ))}
                </ScrollView>

                {/* Always at bottom */}
                <View className='p-5 border-t border-purple-100'>
                    <NewTransactionNumberInput />
                </View>
            </View>
        </SafeAreaView>
    );
}
