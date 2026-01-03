import { usePreferences } from '@/components/Settings/hooks';
import { useConfirmationModalStore } from '@/components/Shared/molecules/ConfirmationModal/state';
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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { BudgetCategorySetup } from './BudgetCategorySetup';
import SelectPlanCategory from './SelectPlanCategory';
import { useCreateBudgetStore } from '../../state/CreateBudgetStore';

type NewFixedBudgetProps = {
    storiesRef: React.RefObject<StoriesRef>;
};

export default function NewFixedBudget({ storiesRef }: NewFixedBudgetProps) {
    const {
        preferences: { customTransactionTypes },
    } = usePreferences();
    const { categoryLimits } = useCreateBudgetStore();
    const { showConfirmationModal } = useConfirmationModalStore();
    const [searchQuery, setSearchQuery] = useState('');
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

    const handleNext = () => {
        const hasAnyAllocation = categoryLimits.some((limit) => (limit.limitAmount ?? 0) > 0);

        if (!hasAnyAllocation) {
            showConfirmationModal({
                title: 'Allocation required',
                message: 'Please allocate money to at least one category before continuing.',
                confirmText: 'OK',
                onConfirm: () => {},
            });
            return;
        }

        storiesRef?.current?.goToPage(storiesRef.current.currentIndex + 1);
    };

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
                selectKey='NewFixedBudgetCategory'
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
                            How much do you want to budget?
                        </Text>
                    </View>

                    <InputField
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder='Search category'
                        className='bg-purple-50/80 rounded-full px-4 border border-purple-100 text-xs h-12'
                        style={satoshiFont.satoshiMedium}
                        returnKeyType='search'
                        autoCorrect={false}
                        autoCapitalize='none'
                        animateBorder={false}
                    />

                    <ScrollView
                        className='flex flex-col space-y-2.5'
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 150 }}
                    >
                        <BudgetCategorySetup searchQuery={searchQuery} />
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
                </SafeAreaView>
            </View>
        </KeyboardAvoidingView>
    );
}
