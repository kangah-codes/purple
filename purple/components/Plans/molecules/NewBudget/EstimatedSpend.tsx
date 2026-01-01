import React, { useRef, useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    InputField,
    LinearGradient,
} from '@/components/Shared/styled';
import { StatusBar } from 'react-native';
import { satoshiFont } from '@/lib/constants/fonts';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import { StoriesRef } from '@/components/Shared/molecules/Stories';
import { useCreateBudgetStore } from '../../state/CreateBudgetStore';
import { usePreferences } from '@/components/Settings/hooks';

type EstimatedSpendProps = {
    storiesRef: React.RefObject<StoriesRef>;
};

export default function EstimatedSpend({ storiesRef }: EstimatedSpendProps) {
    const { estimatedSpend, setEstimatedSpend } = useCreateBudgetStore();
    const {
        preferences: { currency },
    } = usePreferences();

    const [amount, setAmount] = useState(estimatedSpend > 0 ? estimatedSpend.toString() : '0');
    const hiddenInputRef = useRef<any>(null);

    useEffect(() => {
        setTimeout(() => hiddenInputRef.current?.focus(), 50);
    }, []);

    const handleNext = () => {
        const spend = parseFloat(amount || '0');
        setEstimatedSpend(spend);
        storiesRef?.current?.goToPage(storiesRef.current.currentIndex + 1);
    };

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
                style={{
                    position: 'absolute',
                    opacity: 0,
                    height: 0,
                    width: 0,
                }}
            />

            <View className='flex-col h-full justify-between px-5'>
                <View className='flex-col space-y-10 mt-20'>
                    <View className='flex-col'>
                        <Text style={satoshiFont.satoshiBold} className='text-base text-purple-500'>
                            What's your estimated expenditure?
                        </Text>
                        <Text
                            style={satoshiFont.satoshiBold}
                            className='text-sm text-gray-600'
                        >
                            This helps us calculate your budget analytics
                        </Text>
                    </View>

                    <TouchableOpacity
                        className='items-center mt-10 mb-6'
                        onPress={() => hiddenInputRef.current?.focus()}
                        activeOpacity={0.7}
                    >
                        <Text
                            className='text-4xl text-black text-center'
                            style={satoshiFont.satoshiBlack}
                        >
                            {formatCurrencyAccurate(currency, parseFloat(amount || '0'))}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className='items-center self-center justify-center w-full mb-7'>
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
            </View>
        </SafeAreaView>
    );
}
