import { StoriesRef } from '@/components/Shared/molecules/Stories';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import React, { useEffect } from 'react';
import { router } from 'expo-router';
import Checkbox from '@/components/Shared/atoms/Checkbox';
import { useCreateBudgetStore } from '../../state/CreateBudgetStore';

type NewBudgetTypeProps = {
    storiesRef: React.RefObject<StoriesRef>;
};

export default function NewBudgetType({ storiesRef }: NewBudgetTypeProps) {
    const { budgetType, setBudgetType } = useCreateBudgetStore();
    const handleNext = () => {
        if (budgetType) {
            storiesRef?.current?.goToPage(storiesRef.current.currentIndex + 1);
        }
    };

    useEffect(() => {
        // TODO: will remove this later
        setBudgetType('category');
    }, [])

    return (
        <View className='flex flex-col space-y-5 justify-center h-[100%] relative px-5'>
            <View className='flex flex-col space-y-2.5'>
                <Text style={satoshiFont.satoshiBold} className='text-base text-purple-500'>
                    Decide how you'd like to budget
                </Text>
            </View>

            <View className='flex flex-col rounded-3xl border border-purple-100 p-5 bg-purple-50 space-y-5'>
                <View className='flex flex-row justify-between items-center'>
                    <TouchableOpacity
                        className='flex flex-row space-x-1.5 flex-1'
                        onPress={() => setBudgetType('category')}
                    >
                        <View className='mt-1.5'>
                            <Checkbox
                                size={18}
                                checkedColor='#8b5cf6'
                                checked={budgetType === 'category'}
                                onChange={() => setBudgetType('category')}
                            />
                        </View>
                        <View className='flex flex-col flex-1'>
                            <Text style={satoshiFont.satoshiBold} className='text-base'>
                                Fixed Budget
                            </Text>
                            <Text
                                style={satoshiFont.satoshiBold}
                                className='text-sm text-purple-500'
                            >
                                A fixed budget sets specific limits for different categories,
                                helping you control spending and save money.
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View className='h-[1px] border-b border-purple-100 w-full' />

                <View className='flex flex-row justify-between items-center'>
                    <TouchableOpacity
                        className='flex flex-row space-x-1.5 flex-1'
                        onPress={() => setBudgetType('flex')}
                        disabled
                    >
                        <View className='mt-1.5'>
                            <Checkbox
                                size={18}
                                checkedColor='#8b5cf6'
                                checked={budgetType === 'flex'}
                                onChange={() => setBudgetType('flex')}
                                disabled
                            />
                        </View>
                        <View className='flex flex-col flex-1'>
                            <View className='flex flex-row space-x-2.5 items-center'>
                                <Text style={satoshiFont.satoshiBold} className='text-base'>
                                    Flexible Budget
                                </Text>
                                <View className='bg-purple-100 rounded-full px-2 py-1'>
                                    <Text
                                        style={satoshiFont.satoshiBold}
                                        className='text-xs text-purple-500'
                                    >
                                        ✨ Coming Soon
                                    </Text>
                                </View>
                            </View>
                            <Text
                                style={satoshiFont.satoshiBold}
                                className='text-sm text-purple-500'
                            >
                                A flexible budget adapts to your spending habits, allowing for
                                adjustments based on actual income and expenses.
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <View className='items-center self-center justify-center absolute bottom-7 w-full'>
                <View className='flex flex-row space-x-2.5 justify-between w-full'>
                    <View className='flex-1'>
                        <TouchableOpacity
                            onPress={() => {
                                router.back();
                            }}
                            style={{ width: '100%' }}
                            className='bg-purple-50 border border-purple-100 items-center justify-center rounded-full px-5 h-[50]'
                        >
                            <Text
                                style={satoshiFont.satoshiBlack}
                                className='text-purple-600 text-center'
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className='flex-1'>
                        <TouchableOpacity style={{ width: '100%' }} onPress={handleNext}>
                            <LinearGradient
                                className='flex items-center justify-center rounded-full px-5 h-[50]'
                                colors={['#c084fc', '#9333ea']}
                                style={{ width: '100%' }}
                            >
                                <Text
                                    style={satoshiFont.satoshiBlack}
                                    className='text-white text-center'
                                >
                                    Next
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}
