import { useAuth } from '@/components/Auth/hooks';
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
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Keyboard, StatusBar as RNStatusBar } from 'react-native';
import Toast from 'react-native-toast-message';
import { useCreatePlanTransaction, usePlanStore } from '../hooks';
import { transformObject } from '@/lib/utils/object';
import { useAccountStore } from '@/components/Accounts/hooks';
import SelectField from '@/components/Shared/atoms/SelectField';
import { useQueryClient } from 'react-query';
import { usePreferences } from '@/components/Settings/hooks';

export default function NewPlanTransactionScreen() {
    const { sessionData } = useAuth();
    const { currentPlan } = usePlanStore();
    const {
        preferences: { allowOverdraw },
    } = usePreferences();
    const { accounts, getAccountById } = useAccountStore();
    const queryClient = useQueryClient();
    const { mutate, isLoading } = useCreatePlanTransaction({
        planData: {
            id: currentPlan!.id,
            type: currentPlan!.type,
            name: currentPlan!.name,
        },
    });
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            amount: '',
            note: '',
            debit_account_id: '',
        },
    });

    useEffect(() => {
        if (!currentPlan) router.push('/plans');
    }, [currentPlan]);

    const onSubmit = (data: { amount: string; note: string; debit_account_id: string }) => {
        Keyboard.dismiss();
        const account = getAccountById(data.debit_account_id);

        if (!account) {
            Toast.show({
                type: 'error',
                props: {
                    text1: 'Error!',
                    text2: "Couldn't create transaction",
                },
            });
            return;
        }

        if (account.balance - Number(data.amount) < 0 && !allowOverdraw) {
            Toast.show({
                type: 'warning',
                props: { text1: 'Oops!', text2: 'Cannot overdraw account!' },
            });
            return;
        }

        let transformedData = transformObject(data, [
            ['amount', 'amount', (value) => Math.abs(Number(value))],
            [
                'debit_account_id',
                'debit_account_id',
                (value) => (Boolean(value) ? value : undefined),
            ],
        ]);

        mutate(
            { ...transformedData, plan_id: currentPlan!.id, user_id: sessionData?.user.ID },
            {
                onError: (err) => {
                    Toast.show({
                        type: 'error',
                        props: {
                            text1: 'Error!',
                            text2: "Couldn't create transaction",
                        },
                    });
                },
                onSuccess: (res) => {
                    // updateTransactions(res.data);
                    Toast.show({
                        type: 'success',
                        props: { text1: 'Success!', text2: 'Transaction created successfully' },
                    });
                    queryClient.invalidateQueries(`plan-${currentPlan?.id}`);
                    router.back();
                },
            },
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
                            <Text
                                style={GLOBAL_STYLESHEET.satoshiMedium}
                                className='text-purple-600'
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View className='h-1 border-b border-purple-100 w-full' />
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

                        <Controller
                            control={control}
                            rules={{
                                required: "Amount can't be empty",
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <InputField
                                    className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
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

                    <View>
                        <Text
                            style={GLOBAL_STYLESHEET.satoshiBold}
                            className='text-xs text-gray-600'
                        >
                            Debit Account
                        </Text>
                        <>
                            <Controller
                                control={control}
                                rules={{
                                    required: "Debit Account can't be empty",
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <SelectField
                                            selectKey='newPlanTransactionDebitAccount'
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
                                                setValue('debit_account_id', val);
                                            }}
                                        />
                                    </>
                                )}
                                name='debit_account_id'
                            />
                            {errors.debit_account_id && (
                                <Text
                                    style={GLOBAL_STYLESHEET.satoshiMedium}
                                    className='text-xs text-red-500'
                                >
                                    {errors.debit_account_id.message}
                                </Text>
                            )}
                        </>
                    </View>

                    <View className='flex flex-col space-y-1'>
                        <Text
                            style={GLOBAL_STYLESHEET.satoshiBold}
                            className='text-xs text-gray-600'
                        >
                            Note
                        </Text>

                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <InputField
                                    className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                    style={GLOBAL_STYLESHEET.satoshiMedium}
                                    cursorColor={'#8B5CF6'}
                                    placeholder='Note'
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
