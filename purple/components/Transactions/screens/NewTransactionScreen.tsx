import { useAccountStore } from '@/components/Accounts/hooks';
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
import { ActivityIndicator, StatusBar as RNStatusBar } from 'react-native';

export default function NewTransactionScreen() {
    const { type, accountId } = useLocalSearchParams();
    const { accounts } = useAccountStore();
    const [isEnabled, setIsEnabled] = useState(false);
    const [_transactionTypes, setTransactionTypes] = useState<string[]>([]);
    const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
    const [isLoading, setIsLoading] = useState(false);
    const [transactionTypes] = useState([
        {
            key: 'expense',
            label: 'Expense',
        },
        {
            key: 'income',
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
        },
    });

    useEffect(() => {
        const getCachedConstants = async () => {
            const transactionTypes = await nativeStorage.getItem<string[]>('transaction_types');
            if (transactionTypes) setTransactionTypes(transactionTypes);
        };

        getCachedConstants();
    }, []);

    // temporary
    const [index, setIndex] = useState(
        transactionTypes.findIndex((transaction) => transaction.key === (type ?? 'expense')),
    );

    // const renderCurrencies = useCallback(
    //     (item: any) => {
    //         return (
    //             <View className='py-3 border-b border-gray-100 flex flex-row space-x-2 items-center'>
    //                 <Image
    //                     source={
    //                         currencies.find((currency) => currency.code === item.value)?.flag ||
    //                         ''
    //                     }
    //                     style={tw`h-5 w-5 rounded-full`}
    //                 />
    //                 <Text style={GLOBAL_STYLESHEET.interSemiBold} className='tracking-tight'>
    //                     {item.label}
    //                 </Text>
    //             </View>
    //         );
    //     },
    //     [currencies],
    // );

    /**
     * 	AccountId   uuid.UUID `json:"account_id" binding:"required"`
	Type        string    `json:"type" binding:"required,oneof=credit debit transfer"`
	Amount      float64   `json:"amount" validate:"number"`
	Note        string    `json:"note"`
	Category    string    `json:"category" binding:"required"`
	FromAccount uuid.UUID `json:"from_account"`
	ToAccount   uuid.UUID `json:"to_account"`
     */

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
                                        backgroundColor: index === i ? '#fff' : 'rgb(243 232 255)',
                                    }}
                                    key={transaction.label}
                                >
                                    <TouchableOpacity
                                        onPress={() => setIndex(i)}
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
                                required: "Account name can't be empty",
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
                                        {/* <SelectField
                                            selectKey='newPlanType'
                                            options={accountGroups.reduce((acc, curr) => {
                                                acc[curr] = {
                                                    label: curr,
                                                    value: curr,
                                                };
                                                return acc;
                                            }, {} as Record<string, { label: string; value: string }>)}
                                            customSnapPoints={['50%', '55%', '60%']}
                                            renderItem={renderItem}
                                            value={value}
                                            onChange={onChange}
                                        /> */}
                                        <SelectField
                                            selectKey='newTransactionCategory'
                                            options={_transactionTypes.reduce((acc, curr) => {
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

                    {/* <Text
					style={{ fontFamily: "Suprapower" }}
					className="text-base text-black"
				>
					Plan Details
				</Text> */}

                    <View className='flex flex-col space-y-1'>
                        <DatePicker label='Date' pickerKey='newTransactionStartDate' />
                    </View>

                    <View className='h-1 border-b border-gray-100 w-full' />

                    {
                        // rendering different account fields based on transaction type
                        index === 2 ? (
                            <View className='flex flex-col space-y-5'>
                                <View>
                                    <SelectField
                                        selectKey='newTransactionDebitAccount'
                                        label='Debit Account'
                                        options={{
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
                                        }}
                                        customSnapPoints={['30%', '30%']}
                                    />
                                </View>

                                <View>
                                    <SelectField
                                        selectKey='newTransactionCreditAccount'
                                        label='Credit Account'
                                        options={{
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
                                        }}
                                        customSnapPoints={['30%', '30%']}
                                    />
                                </View>
                            </View>
                        ) : (
                            <View>
                                <SelectField
                                    selectKey='newTransactionAccount'
                                    label='Account'
                                    options={accounts.reduce((acc, curr) => {
                                        acc[curr.name] = {
                                            label: curr.name,
                                            value: curr.ID,
                                        };
                                        return acc;
                                    }, {} as Record<string, { label: string; value: string }>)}
                                    customSnapPoints={['50%', '70%']}
                                />
                            </View>
                        )
                    }

                    <View className='flex flex-col space-y-1'>
                        <Text style={{ fontFamily: 'InterBold' }} className='text-xs text-gray-600'>
                            Note
                        </Text>

                        <InputField
                            className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                            style={GLOBAL_STYLESHEET.interSemiBold}
                            cursorColor={'#8B5CF6'}
                        />
                    </View>
                </ScrollView>

                <TouchableOpacity
                    onPress={() => {
                        setIsLoading(true);
                        setTimeout(() => {
                            setIsLoading(false);
                        }, 3000);
                    }}
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
