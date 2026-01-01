import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StatusBar as RNStatusBar } from 'react-native';
import {
    LinearGradient,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { StoriesRef } from '@/components/Shared/molecules/Stories';
import { satoshiFont } from '@/lib/constants/fonts';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { useCreateBudgetStore } from '../../state/CreateBudgetStore';
import { usePreferences } from '@/components/Settings/hooks';
import { router } from 'expo-router';
import { useCreateBudget } from '../../hooks';
import Toast from 'react-native-toast-message';

type BudgetSummaryProps = {
    storiesRef: React.RefObject<StoriesRef>;
};

export default function BudgetSummary({ storiesRef }: BudgetSummaryProps) {
    const {
        budgetType,
        categoryLimits,
        estimatedIncome,
        estimatedSpend,
        month,
        year,
        flexAllocations,
        reset,
    } = useCreateBudgetStore();
    const {
        preferences: { currency },
    } = usePreferences();
    const { mutate: createBudget } = useCreateBudget();
    const [isSaving, setIsSaving] = useState(false);

    const totalBudget = categoryLimits.reduce((sum, limit) => sum + limit.limitAmount, 0);
    const cashFlow = estimatedIncome - totalBudget;
    const spendRatio = estimatedIncome > 0 ? (totalBudget / estimatedIncome) * 100 : 0;

    const getMonthName = (monthNumber: number) => {
        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
        return months[monthNumber - 1];
    };

    const handleSave = async () => {
        if (!budgetType) {
            Toast.show({
                type: 'error',
                props: { text1: 'Error', text2: 'Please select a budget type' },
            });
            return;
        }

        if (categoryLimits.length === 0) {
            Toast.show({
                type: 'error',
                props: { text1: 'Error', text2: 'Please add at least one category' },
            });
            return;
        }

        setIsSaving(true);

        createBudget(
            {
                name: `${getMonthName(month)} ${year} Budget`,
                type: budgetType,
                month,
                year,
                currency,
                estimatedIncome,
                estimatedSpend,
                categoryLimits,
                flexAllocations,
            },
            {
                onSuccess: () => {
                    Toast.show({
                        type: 'success',
                        props: { text1: 'Success', text2: 'Budget created successfully' },
                    });
                    reset();
                    router.back();
                },
                onError: (error) => {
                    Toast.show({
                        type: 'error',
                        props: {
                            text1: 'Error',
                            text2: error.message || 'Failed to create budget',
                        },
                    });
                    setIsSaving(false);
                },
            },
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View className='flex flex-col space-y-5 h-[100%] relative px-5'>
                <SafeAreaView
                    className='flex flex-col space-y-2.5 h-[100%] relative'
                    style={{
                        paddingTop: RNStatusBar.currentHeight! * 2,
                    }}
                >
                    <View className='flex flex-col'>
                        <Text style={satoshiFont.satoshiBold} className='text-base text-purple-500'>
                            Budget Summary
                        </Text>
                        <Text style={satoshiFont.satoshiBlack} className='text-2xl text-black mt-1'>
                            {formatCurrencyRounded(totalBudget, currency)}
                        </Text>
                    </View>

                    <ScrollView
                        className='flex flex-col space-y-2.5'
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 150 }}
                    >
                        <View className='bg-purple-50 rounded-3xl border border-purple-100 p-5'>
                            <View className='flex-row justify-between items-center'>
                                <View className='flex-col'>
                                    <Text
                                        style={satoshiFont.satoshiBold}
                                        className='text-xs text-purple-500'
                                    >
                                        Budget Period
                                    </Text>
                                    <Text
                                        style={satoshiFont.satoshiBlack}
                                        className='text-lg text-black mt-1'
                                    >
                                        {getMonthName(month)} {year}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {estimatedIncome > 0 && (
                            <View className='bg-purple-50 rounded-3xl border border-purple-100 p-5'>
                                <View className='flex-col space-y-3'>
                                    <View className='flex-row justify-between items-center'>
                                        <View className='flex-col'>
                                            <Text
                                                style={satoshiFont.satoshiBold}
                                                className='text-xs text-purple-500'
                                            >
                                                Income
                                            </Text>
                                            <Text
                                                style={satoshiFont.satoshiBlack}
                                                className='text-lg text-black mt-1'
                                            >
                                                {formatCurrencyRounded(estimatedIncome, currency)}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className='h-[0.5px] border-b border-purple-100' />

                                    <View className='flex-row justify-between items-center'>
                                        <View className='flex-col'>
                                            <Text
                                                style={satoshiFont.satoshiBold}
                                                className='text-xs text-purple-500'
                                            >
                                                Cash Flow
                                            </Text>
                                            <Text
                                                style={satoshiFont.satoshiBlack}
                                                className={`text-lg mt-1 ${
                                                    cashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}
                                            >
                                                {formatCurrencyRounded(cashFlow, currency)}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className='h-[0.5px] border-b border-purple-100' />

                                    <View className='flex-row justify-between items-center'>
                                        <View className='flex-col'>
                                            <Text
                                                style={satoshiFont.satoshiBold}
                                                className='text-xs text-purple-500'
                                            >
                                                Spend Ratio
                                            </Text>
                                            <Text
                                                style={satoshiFont.satoshiBlack}
                                                className='text-lg text-black mt-1'
                                            >
                                                {spendRatio.toFixed(1)}%
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}

                        <View className='bg-purple-50 rounded-3xl border border-purple-100 p-5'>
                            <View className='flex-row justify-between items-center mb-4'>
                                <Text
                                    style={satoshiFont.satoshiBold}
                                    className='text-base text-black'
                                >
                                    Category Limits
                                </Text>
                                <Text
                                    style={satoshiFont.satoshiBlack}
                                    className='text-sm text-purple-500'
                                >
                                    {categoryLimits.length} categor{categoryLimits.length === 1 ? 'y' : 'ies'}
                                </Text>
                            </View>

                            <View className='h-[1px] border-b border-purple-100 w-full mb-2' />

                            {categoryLimits.map((limit, idx) => {
                                return (
                                    <React.Fragment key={limit.category}>
                                        <View className='flex-row justify-between items-center py-2.5'>
                                            <Text
                                                style={satoshiFont.satoshiBold}
                                                className='text-sm text-black flex-1'
                                            >
                                                {limit.category}
                                            </Text>
                                            <Text
                                                style={satoshiFont.satoshiBlack}
                                                className='text-sm text-purple-500'
                                            >
                                                {formatCurrencyRounded(limit.limitAmount, currency)}
                                            </Text>
                                        </View>
                                        {idx < categoryLimits.length - 1 && (
                                            <View className='h-[0.5px] border-b border-purple-100' />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </View>

                        <View className='bg-purple-50 rounded-3xl border border-purple-100 p-5'>
                            <View className='flex-row justify-between items-center'>
                                <Text
                                    style={satoshiFont.satoshiBold}
                                    className='text-base text-black'
                                >
                                    Total Budget
                                </Text>
                                <Text
                                    style={satoshiFont.satoshiBlack}
                                    className='text-lg text-purple-500'
                                >
                                    {formatCurrencyRounded(totalBudget, currency)}
                                </Text>
                            </View>
                        </View>
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
                                    onPress={handleSave}
                                    disabled={isSaving}
                                >
                                    <LinearGradient
                                        className='flex items-center justify-center rounded-full px-5 h-[50]'
                                        colors={['#c084fc', '#9333ea']}
                                        style={{ width: '100%', opacity: isSaving ? 0.5 : 1 }}
                                    >
                                        <Text
                                            style={satoshiFont.satoshiBlack}
                                            className='text-white text-center'
                                        >
                                            {isSaving ? 'Creating...' : 'Create Budget'}
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
