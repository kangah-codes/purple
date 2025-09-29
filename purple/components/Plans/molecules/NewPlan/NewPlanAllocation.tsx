/* eslint-disable no-constant-condition */
import { StoriesRef } from '@/components/Shared/molecules/Stories';
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
import { router } from 'expo-router';
import React, { useRef, useCallback, useEffect } from 'react';
import { ActivityIndicator, StatusBar as RNStatusBar } from 'react-native';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import { ChevronDownIcon } from '@/components/SVG/icons/16x16';
import { TRANSACTION_CATEGORY } from '@/lib/constants/transactionTypes';

type NewPlanAllocationProps = {
    storiesRef: React.RefObject<StoriesRef>;
};

export default function NewPlanAllocation({ storiesRef }: NewPlanAllocationProps) {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const holdDurationRef = useRef(0);

    // Clear any active timers
    const clearTimers = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        holdDurationRef.current = 0;
    }, []);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            clearTimers();
        };
    }, [clearTimers]);
    return (
        <View className='flex flex-col space-y-5 h-[100%] relative px-5'>
            <SafeAreaView
                className='flex flex-col space-y-2.5 h-[100%] relative'
                style={{
                    paddingTop: RNStatusBar.currentHeight! * 2,
                }}
            >
                <View className='flex flex-col'>
                    <Text style={satoshiFont.satoshiBold} className='text-base text-purple-500'>
                        Let's allocate some money
                    </Text>

                    {/* <View className='bg-purple-100 rounded-3xl p-3.5 flex flex-col space-y-2.5 border border-purple-100'>
                        <Text style={satoshiFont.satoshiBold} className='text-sm text-purple-500'>
                            🤔 Not sure how much to allocate? We can suggest some amounts based on
                            your income.
                        </Text>
                        <Text style={satoshiFont.satoshiBold} className='text-sm text-purple-700'>
                            Suggest amounts
                        </Text>
                    </View> */}
                </View>

                <ScrollView
                    className='flex flex-col space-y-2.5'
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 150 }}
                >
                    <View className='flex flex-row justify-between items-center'>
                        <Text style={satoshiFont.satoshiBold} className='text-sm text-purple-500'>
                            Categories
                        </Text>
                        <Text style={satoshiFont.satoshiBlack} className='text-lg text-black'>
                            {formatCurrencyAccurate('GHS', 2050)}
                        </Text>
                    </View>

                    <View className='flex flex-col space-y-3'>
                        {/* Rent */}
                        {TRANSACTION_CATEGORY.map((c) => (
                            <View className='flex flex-row items-center justify-between space-x-2.5'>
                                <TouchableOpacity className='flex flex-row items-center space-x-3'>
                                    <View className='relative items-center justify-center flex rounded-full h-12 w-12 bg-purple-100'>
                                        <Text className='absolute text-lg'>{c.emoji}</Text>
                                    </View>
                                </TouchableOpacity>
                                {/* <InputField
                                    className='bg-purple-50/80 rounded-full px-4 text-xs border border-purple-200 h-12 flex-1'
                                    style={satoshiFont.satoshiMedium}
                                    cursorColor={'#8B5CF6'}
                                    placeholder='Add a note...'
                                    // onChangeText={onChange}
                                    // onBlur={onBlur}
                                    // value={value}
                                    value='Rent'
                                /> */}
                                <View className='flex flex-col'>
                                    <Text className='text-sm' style={satoshiFont.satoshiBold}>
                                        {c.category}
                                    </Text>
                                    <Text
                                        className='text-xs text-purple-500'
                                        style={satoshiFont.satoshiBold}
                                    >
                                        32%
                                    </Text>
                                </View>
                                <InputField
                                    className='bg-purple-50/80 rounded-full px-4 w-[40%] text-xs border border-purple-200 h-12 flex-1'
                                    style={satoshiFont.satoshiMedium}
                                    cursorColor={'#8B5CF6'}
                                    placeholder='Amount'
                                    keyboardType='numeric'
                                    // onChangeText={onChange}
                                    // onBlur={onBlur}
                                    // value={value}
                                />
                                <TouchableOpacity className='flex flex-row items-center space-x-3'>
                                    <View className='relative items-center justify-center flex rounded-full h-12 w-12 bg-purple-100'>
                                        <ChevronDownIcon
                                            strokeWidth={3}
                                            width={17}
                                            stroke='#9333ea'
                                        />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        className='rounded-full justify-center items-center p-4 bg-purple-100'
                        style={{
                            borderWidth: 1,
                            borderColor: '#a855f7',
                            borderStyle: 'dashed',
                        }}
                        onPress={() => router.push('/accounts/new-acount')}
                    >
                        <Text style={satoshiFont.satoshiBold} className='text-sm text-[#a855f7]'>
                            Add new category
                        </Text>
                    </TouchableOpacity>
                </ScrollView>

                <View className='items-center self-center justify-center absolute bottom-7 w-full'>
                    <View className='flex flex-row space-x-2.5 justify-between w-full'>
                        <View className='flex-1'>
                            <TouchableOpacity
                                onPress={() =>
                                    storiesRef?.current?.goToPage(
                                        storiesRef.current.currentIndex - 1,
                                    )
                                }
                                style={{ width: '100%' }}
                                className='bg-purple-50 border border-purple-100 items-center justify-center rounded-full px-5 h-[50]'
                            >
                                <Text
                                    style={satoshiFont.satoshiBlack}
                                    className='text-purple-600 text-center'
                                >
                                    Back
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View className='flex-1'>
                            <TouchableOpacity
                                style={{ width: '100%' }}
                                // onPress={handleSubmit(onSubmit)}
                                // disabled={isLoading}
                            >
                                <LinearGradient
                                    className='flex items-center justify-center rounded-full px-5 h-[50]'
                                    colors={['#c084fc', '#9333ea']}
                                    style={{ width: '100%' }}
                                >
                                    {false ? (
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
        </View>
    );
}
