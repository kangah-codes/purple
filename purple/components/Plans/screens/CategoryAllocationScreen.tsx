import React, { useRef, useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    InputField,
    LinearGradient,
} from '@/components/Shared/styled';
import { StatusBar, Keyboard } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { satoshiFont } from '@/lib/constants/fonts';
import { formatCurrencyAccurate, formatCurrencyRounded } from '@/lib/utils/number';
import { ArrowLeftIcon } from '@/components/SVG/icons/24x24';
import { CheckMarkIcon } from '@/components/SVG/icons/noscale';
import { useCreateBudgetStore } from '../state/CreateBudgetStore';
import { usePreferences } from '@/components/Settings/hooks';
import { useBudgetCategoryStats } from '../hooks';

export default function CategoryAllocationScreen() {
    const params = useLocalSearchParams<{ category: string; currentAmount?: string }>();
    const category = typeof params.category === 'string' ? params.category : '';
    const { categoryLimits, updateCategoryLimit, addCategoryLimit } = useCreateBudgetStore();
    const {
        preferences: { currency },
    } = usePreferences();
    const existingLimit = categoryLimits.find((l) => l.category === category);
    const { data: categoryStats } = useBudgetCategoryStats(category);
    const [amount, setAmount] = useState(
        params.currentAmount || existingLimit?.limitAmount.toString() || '0',
    );

    const hiddenInputRef = useRef<any>(null);

    useEffect(() => {
        setTimeout(() => hiddenInputRef.current?.focus(), 50);

        const listener = Keyboard.addListener('keyboardDidHide', () => {
            setTimeout(() => hiddenInputRef.current?.focus(), 50);
        });

        return () => listener.remove();
    }, []);

    const handleSave = () => {
        const limitAmount = parseFloat(amount || '0');

        if (existingLimit) {
            updateCategoryLimit(category, limitAmount);
        } else {
            addCategoryLimit({
                category,
                limitAmount,
            });
        }

        router.back();
    };

    const handleCancel = () => router.back();

    return (
        <SafeAreaView
            className='bg-white h-full'
            style={{
                paddingTop: StatusBar.currentHeight,
            }}
        >
            <StatusBar barStyle='dark-content' />

            <InputField
                ref={hiddenInputRef}
                autoFocus
                keyboardType='decimal-pad'
                value={amount.toString()}
                onChangeText={(text) => {
                    if (/^\d*\.?\d*$/.test(text)) {
                        setAmount(text === '' ? '0' : text);
                    }
                }}
                className=''
                style={{
                    position: 'absolute',
                    opacity: 0,
                    height: 0,
                    width: 0,
                    top: -100,
                }}
                onBlur={() => {
                    setTimeout(() => hiddenInputRef.current?.focus(), 50);
                }}
            />

            <View className='w-full flex flex-row justify-between items-center relative px-5 py-2.5'>
                <TouchableOpacity
                    onPress={handleCancel}
                    className='bg-purple-50 px-4 py-2 flex items-center justify-center rounded-full'
                >
                    <ArrowLeftIcon stroke={'#9333ea'} width={24} height={24} strokeWidth={2.5} />
                </TouchableOpacity>

                <View className='absolute left-0 right-0 items-center'>
                    <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                        {params.category}
                    </Text>
                </View>

                <LinearGradient
                    className='rounded-full justify-center items-center'
                    colors={['#c084fc', '#9333ea']}
                >
                    <TouchableOpacity
                        className='px-4 py-2 flex items-center justify-center rounded-full'
                        onPress={handleSave}
                    >
                        <CheckMarkIcon stroke={'#faf5ff'} width={24} height={24} />
                    </TouchableOpacity>
                </LinearGradient>
            </View>

            <ScrollView
                className='flex-1 space-y-2.5'
                contentContainerStyle={{ paddingHorizontal: 20 }}
            >
                <View className='items-center mt-10 mb-6'>
                    <Text
                        className='text-4xl text-black text-center'
                        style={satoshiFont.satoshiBlack}
                    >
                        {formatCurrencyAccurate(currency, parseFloat(amount || '0'))}
                    </Text>
                </View>

                <View className='flex-row justify-between space-x-2.5'>
                    <View className='flex-1 bg-purple-50 rounded-3xl p-5 items-center border border-purple-100'>
                        <Text className='text-xl text-black mb-1' style={satoshiFont.satoshiBlack}>
                            {formatCurrencyRounded(categoryStats?.lastMonthBudgeted ?? 0, currency)}
                        </Text>
                        <Text className='text-sm text-purple-500' style={satoshiFont.satoshiBold}>
                            Budgeted last month
                        </Text>
                    </View>
                    <View className='flex-1 bg-purple-50 rounded-3xl p-5 items-center border border-purple-100'>
                        <Text className='text-xl text-black mb-1' style={satoshiFont.satoshiBlack}>
                            {formatCurrencyRounded(categoryStats?.averageBudgeted ?? 0, currency)}
                        </Text>
                        <Text className='text-sm text-purple-500' style={satoshiFont.satoshiBold}>
                            Monthly Average
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
