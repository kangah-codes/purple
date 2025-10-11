/* eslint-disable no-constant-condition */
import { StoriesRef } from '@/components/Shared/molecules/Stories';
import {
    LinearGradient,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import {
    ActivityIndicator,
    StatusBar as RNStatusBar,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import NewPlanItem from './NewPlanItem';
import { FlashList } from '@shopify/flash-list';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import SelectPlanCategory from './SelectPlanCategory';
import { usePreferences } from '@/components/Settings/hooks';
import { useCreateNewPlanStore } from '../../hooks';

type NewPlanAllocationProps = {
    storiesRef: React.RefObject<StoriesRef>;
};

export default function NewPlanAllocation({ storiesRef }: NewPlanAllocationProps) {
    const { setShowBottomSheetFlatList } = useBottomSheetFlatListStore();
    const {
        preferences: { customTransactionTypes },
    } = usePreferences();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const holdDurationRef = useRef(0);
    const { categories } = useCreateNewPlanStore();

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

    const transactionTypes = useMemo(
        () =>
            customTransactionTypes.map(
                (transaction) => `${transaction.emoji} ${transaction.category}`,
            ),
        [customTransactionTypes],
    );

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            clearTimers();
        };
    }, [clearTimers]);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <SelectPlanCategory
                options={transactionTypes.reduce((acc, curr) => {
                    acc[curr] = {
                        label: curr,
                        value: curr,
                    };
                    return acc;
                }, {} as Record<string, { label: string; value: string }>)}
                selectKey='newPlanAllocationCategory'
                customSnapPoints={['40%', '50%']}
            />
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

                        <View className='flex flex-row justify-start items-baseline'>
                            <Text style={satoshiFont.satoshiBlack} className='text-2xl text-black'>
                                {formatCurrencyAccurate('GHS', 205430)}
                            </Text>
                            <Text
                                style={satoshiFont.satoshiMedium}
                                className='text-sm text-purple-500 ml-1'
                            >
                                /63 days
                            </Text>
                        </View>
                    </View>

                    <ScrollView
                        className='flex flex-col space-y-2.5'
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 150 }}
                    >
                        <View>
                            <FlashList
                                data={categories}
                                keyExtractor={(item) => item.category}
                                renderItem={({ item }) => (
                                    <View className='flex flex-col my-2.5'>
                                        <NewPlanItem
                                            category={item.category}
                                            allocation={item.allocation}
                                        />
                                    </View>
                                )}
                                scrollEnabled={false}
                                showsVerticalScrollIndicator={false}
                                ItemSeparatorComponent={() => (
                                    <View className='h-[1px] border-b border-purple-100 my-0.5' />
                                )}
                            />
                        </View>

                        <TouchableOpacity
                            className='rounded-full justify-center items-center p-4 bg-purple-100'
                            style={{
                                borderWidth: 1,
                                borderColor: '#a855f7',
                                borderStyle: 'dashed',
                            }}
                            onPress={() => {
                                setShowBottomSheetFlatList('newPlanAllocationCategory', true);
                            }}
                        >
                            <Text
                                style={satoshiFont.satoshiBold}
                                className='text-sm text-[#a855f7]'
                            >
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
        </KeyboardAvoidingView>
    );
}
