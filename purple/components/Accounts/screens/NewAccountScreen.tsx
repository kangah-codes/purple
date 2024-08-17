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
import { ActivityIndicator, StatusBar as RNStatusBar, StyleSheet } from 'react-native';

export default function NewAccountScreen() {
    const [isLoading, setIsLoading] = useState(false);
    const renderItem = useCallback((item: any) => {
        return (
            <View className='py-3 border-b border-gray-100'>
                <Text>{item.label}</Text>
            </View>
        );
    }, []);

    return (
        <>
            <SafeAreaView className='bg-white relative h-full'>
                <ExpoStatusBar style='dark' />
                <View className='w-full flex flex-row px-5 py-2.5 justify-between items-center'>
                    <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg'>
                        New Account
                    </Text>

                    <TouchableOpacity onPress={router.back}>
                        <Text style={GLOBAL_STYLESHEET.interSemiBold} className='text-purple-600'>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
                <ScrollView
                    className='space-y-5 flex-1 flex flex-col p-5'
                    contentContainerStyle={styles.scrollView}
                >
                    <>
                        <SelectField
                            selectKey='newPlanType'
                            label='Account Group'
                            options={{
                                expense: {
                                    label: '💸   Expense',
                                    value: 'expense',
                                },
                                saving: {
                                    label: '💰   Saving',
                                    value: 'saving',
                                },
                            }}
                            customSnapPoints={['50%', '55%', '60%']}
                            renderItem={renderItem}
                        />
                    </>

                    <View className='flex flex-col space-y-1'>
                        <Text style={{ fontFamily: 'InterBold' }} className='text-xs text-gray-600'>
                            Account Name
                        </Text>

                        <InputField
                            className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                            style={GLOBAL_STYLESHEET.interSemiBold}
                            cursorColor={'#8B5CF6'}
                        />
                    </View>

                    <View className='flex flex-col space-y-1'>
                        <Text style={{ fontFamily: 'InterBold' }} className='text-xs text-gray-600'>
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
                                Create Account
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        paddingBottom: 100,
    },
});
