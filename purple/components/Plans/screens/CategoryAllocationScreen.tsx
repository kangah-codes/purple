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
import Switch from '@/components/Shared/atoms/Switch';

export default function CategoryAllocationScreen() {
    const params = useLocalSearchParams<{ category: string; currentAmount?: string }>();
    const [amount, setAmount] = useState(params.currentAmount || 0);
    const [applyToFuture, setApplyToFuture] = useState(false);

    const hiddenInputRef = useRef<any>(null);

    // 🔥 FORCE KEYBOARD TO STAY OPEN
    useEffect(() => {
        // Auto-focus shortly after mount
        setTimeout(() => hiddenInputRef.current?.focus(), 50);

        // Re-open keyboard if it ever hides
        const listener = Keyboard.addListener('keyboardDidHide', () => {
            setTimeout(() => hiddenInputRef.current?.focus(), 50);
        });

        return () => listener.remove();
    }, []);

    const handleSave = () => router.back();
    const handleCancel = () => router.back();

    const displayAmount = Number(amount === '.' ? 0 : amount || 0);

    return (
        <SafeAreaView
            className='bg-white h-full'
            style={{
                paddingTop: StatusBar.currentHeight,
            }}
        >
            <StatusBar barStyle='dark-content' />

            {/* 🔥 HIDDEN INPUT THAT NEVER LOSES FOCUS */}
            <InputField
                ref={hiddenInputRef}
                autoFocus
                keyboardType='decimal-pad'
                value={amount}
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
                    // instantly refocus to keep keyboard always open
                    setTimeout(() => hiddenInputRef.current?.focus(), 50);
                }}
            />

            <View className='w-full flex flex-row justify-between items-center relative px-5 py-2.5'>
                <TouchableOpacity
                    onPress={router.back}
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
                        onPress={() => router.push('/transactions/new')}
                    >
                        <CheckMarkIcon stroke={'#faf5ff'} width={24} height={24} />
                    </TouchableOpacity>
                </LinearGradient>
            </View>

            <ScrollView
                className='flex-1 space-y-2.5'
                contentContainerStyle={{ paddingHorizontal: 20 }}
            >
                {/* Amount Display */}
                <View className='items-center mt-10 mb-6'>
                    <Text
                        className='text-4xl text-black text-center'
                        style={satoshiFont.satoshiBlack}
                    >
                        {formatCurrencyAccurate('GHS', amount)}
                    </Text>
                </View>

                {/* Stats */}
                <View className='flex-row justify-between space-x-2.5'>
                    <View className='flex-1 bg-purple-50 rounded-3xl p-5 items-center border border-purple-100'>
                        <Text className='text-xl text-black mb-1' style={satoshiFont.satoshiBlack}>
                            {formatCurrencyRounded(0, 'GHS')}
                        </Text>
                        <Text className='text-sm text-purple-500' style={satoshiFont.satoshiBold}>
                            Spent last month
                        </Text>
                    </View>
                    <View className='flex-1 bg-purple-50 rounded-3xl p-5 items-center border border-purple-100'>
                        <Text className='text-xl text-black mb-1' style={satoshiFont.satoshiBlack}>
                            {formatCurrencyRounded(0, 'GHS')}
                        </Text>
                        <Text className='text-sm text-purple-500' style={satoshiFont.satoshiBold}>
                            Monthly Average
                        </Text>
                    </View>
                </View>

                {/* Apply to Future Months Toggle */}
                <View className='flex-row justify-between items-center bg-purple-50 rounded-3xl p-5 border border-purple-100'>
                    <View className='flex-row items-center flex-1'>
                        <Text className='text-sm text-black mr-2' style={satoshiFont.satoshiBold}>
                            Apply {formatCurrencyRounded(displayAmount, 'GHS')} to all future months
                        </Text>
                    </View>

                    <Switch />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
