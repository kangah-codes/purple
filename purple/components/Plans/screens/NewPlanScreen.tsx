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
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Switch } from 'react-native';

export default function NewPlanScreen() {
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
    const [isLoading, setIsLoading] = useState(false);
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

    return (
        <>
            <SafeAreaView className='bg-white relative h-full'>
                <ExpoStatusBar style='dark' />
                <View className='w-full flex flex-row px-5 py-2.5 justify-between items-center'>
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

                        <InputField
                            className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                            style={GLOBAL_STYLESHEET.interSemiBold}
                            cursorColor={'#8B5CF6'}
                        />
                    </View>

                    <View>
                        <SelectField
                            selectKey='newPlanType'
                            label='Plan Type'
                            options={planTypes}
                            customSnapPoints={['25%', '25%']}
                            renderItem={renderItem}
                        />
                    </View>

                    <View>
                        <SelectField
                            selectKey='newPlanCategory'
                            label='Category'
                            options={{
                                kanye: {
                                    label: 'Kanye',
                                    value: 'kanye',
                                },
                                rihanna: {
                                    label: 'Rihanna',
                                    value: 'rihanna',
                                },
                                drake: {
                                    label: 'Drake',
                                    value: 'drake',
                                },
                            }}
                            customSnapPoints={['30%', '40%']}
                        />
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
                        <DatePicker label='Start Date' pickerKey='newPlanStartDate' />
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
});
