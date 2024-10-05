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
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useEffect } from 'react';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Switch,
    StatusBar as RNStatusBar,
} from 'react-native';

/**
 * 
 * @returns type CreatePlanDTO struct {
	AccountId        uuid.UUID `json:"account_id" binding:"required"`
	Type             string    `json:"type" binding:"required,oneof=saving expense"`
	Category         string    `json:"category" binding:"required"`
	Target           float64   `json:"target" validate:"number"`
	StartDate        string    `json:"start_date" binding:"required"`
	EndDate          string    `json:"end_date" binding:"required"`
	DepositFrequency string    `json:"deposit_frequency" binding:"required,oneof=daily weekly bi-weekly monthly yearly"`
	PushNotification bool      `json:"push_notification" binding:"required"`
	Name             string    `json:"name" binding:"required"`
}
 */

export default function NewPlanScreen() {
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
    const [isLoading, setIsLoading] = useState(false);
    const [planCategories, setPlanCategories] = useState<string[]>([]);
    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm({
        defaultValues: {
            plan_type: '',
            category: '',
            amount: '',
            account_id: '',
            start_date: '',
            end_date: '',
            deposit_frequency: '',
            push_notification: false,
            name: '',
        },
    });
    const renderItem = useCallback(
        (item: any) => (
            <View className='py-3 border-b border-gray-100'>
                <Text>{item.label}</Text>
            </View>
        ),
        [],
    );

    const planTypes = {
        expense: {
            label: '💸   Expense',
            value: 'expense',
        },
        saving: {
            label: '💰   Saving',
            value: 'saving',
        },
    };
    const depositFrequency = {
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
    };

    useEffect(() => {
        const getCachedConstants = async () => {
            const cachedTypes = await nativeStorage.getItem<string[]>('transaction_types');
            if (cachedTypes) setPlanCategories(cachedTypes);
        };
        getCachedConstants();
    }, []);

    return (
        <>
            <SafeAreaView className='bg-white relative h-full'>
                <ExpoStatusBar style='dark' />
                <View
                    style={styles.parentView}
                    className='w-full flex flex-row px-5 py-2.5 justify-between items-center'
                >
                    <View className='flex flex-col'>
                        <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg'>
                            New Plan
                        </Text>
                    </View>

                    <TouchableOpacity onPress={router.back}>
                        <Text style={GLOBAL_STYLESHEET.interSemiBold} className='text-purple-600'>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
                <ScrollView
                    className='space-y-5 flex-1 flex flex-col p-5'
                    contentContainerStyle={styles.container}
                >
                    <View className='flex flex-col space-y-1'>
                        <Text style={GLOBAL_STYLESHEET.interBold} className='text-xs text-gray-600'>
                            Plan Name
                        </Text>

                        <Controller
                            control={control}
                            rules={{
                                required: "Debit account can't be empty",
                            }}
                            render={({ field: { onChange, value, onBlur } }) => (
                                <InputField
                                    className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                                    style={GLOBAL_STYLESHEET.interSemiBold}
                                    cursorColor={'#8B5CF6'}
                                    placeholder='Plan Name'
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={value}
                                />
                            )}
                            name='name'
                        />
                        {errors.name && (
                            <Text
                                style={{ fontFamily: 'InterMedium' }}
                                className='text-xs text-red-500'
                            >
                                {errors.name.message}
                            </Text>
                        )}
                    </View>

                    <View>
                        <Text style={{ fontFamily: 'InterBold' }} className='text-xs text-gray-600'>
                            Plan Type
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
                                            selectKey='newPlanTypes'
                                            options={planTypes}
                                            customSnapPoints={['30%', '40%']}
                                            value={value}
                                            onChange={onChange}
                                        />
                                    </>
                                )}
                                name='plan_type'
                            />
                            {errors.plan_type && (
                                <Text
                                    style={{ fontFamily: 'InterMedium' }}
                                    className='text-xs text-red-500'
                                >
                                    {errors.plan_type.message}
                                </Text>
                            )}
                        </>
                    </View>

                    <View>
                        <Text style={{ fontFamily: 'InterBold' }} className='text-xs text-gray-600'>
                            Plan Category
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
                                            selectKey='newPlanCategory'
                                            options={planCategories.reduce((acc, curr) => {
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
                                    style={{ fontFamily: 'InterMedium' }}
                                    className='text-xs text-red-500'
                                >
                                    {errors.category.message}
                                </Text>
                            )}
                        </>
                    </View>

                    <View className='flex flex-col space-y-1'>
                        <Text style={GLOBAL_STYLESHEET.interBold} className='text-xs text-gray-600'>
                            Amount
                        </Text>

                        <InputField
                            className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                            style={GLOBAL_STYLESHEET.interSemiBold}
                            cursorColor={'#8B5CF6'}
                            placeholder='0.00'
                        />
                    </View>

                    <View>
                        <SelectField
                            selectKey='newPlanAccount'
                            label='Account'
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

                    <View className='h-1 border-b border-gray-100 w-full' />

                    <View className='flex flex-col space-y-1'>
                        <DatePicker
                            label='Start Date'
                            pickerKey='newPlanStartDate'
                            minimumDate={new Date()}
                        />
                    </View>

                    <View className='flex flex-col space-y-1'>
                        <DatePicker label='End Date' pickerKey='newPlanEndDate' />
                    </View>

                    <View className='h-1 border-b border-gray-100 w-full' />

                    <View>
                        <SelectField
                            selectKey='newPlanDepositFrequency'
                            label='Deposit Frequency'
                            options={depositFrequency}
                            customSnapPoints={['30%', '30%']}
                        />
                    </View>

                    <View className='flex flex-row justify-between items-center'>
                        <Text style={GLOBAL_STYLESHEET.interBold} className='text-xs text-gray-600'>
                            Send me reminders
                        </Text>

                        <Switch
                            trackColor={{ false: '#767577', true: '#8B5CF6' }}
                            thumbColor={'#f4f3f4'}
                            ios_backgroundColor='#3e3e3e'
                            onValueChange={toggleSwitch}
                            value={isEnabled}
                            style={styles.switch}
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
                                Create Plan
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    switch: {
        transform: Platform.OS === 'ios' ? [{ scaleX: 0.8 }, { scaleY: 0.8 }] : [],
    },
    container: {
        paddingBottom: 100,
    },
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
