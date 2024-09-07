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
import { router, useLocalSearchParams } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar as RNStatusBar } from 'react-native';

export default function NewTransactionScreen() {
    const { type } = useLocalSearchParams();
    const [isEnabled, setIsEnabled] = useState(false);
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

    // temporary
    const [index, setIndex] = useState(0);

    return (
        <>
            {/* <Stack.Screen
				options={{
					headerStyle: {
						backgroundColor: "#fff",
					},
					headerTitleStyle: {
						fontFamily: "Suprapower",
					},
					headerLeft: () => (
						<TouchableOpacity onPress={() => router.back()}>
							<ChevronLeftIcon stroke="#000" />
						</TouchableOpacity>
					),
					headerTitle: "New Transaction",
					headerTitleAlign: "center",
					headerShown: false,
				}}
			/> */}
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

                        <InputField
                            className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 text-gray-900'
                            style={GLOBAL_STYLESHEET.interSemiBold}
                            cursorColor={'#8B5CF6'}
                        />
                    </View>

                    <View>
                        <SelectField
                            selectKey='newTransactionCategory'
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
