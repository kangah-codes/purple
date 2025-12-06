import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from '@/components/Shared/styled';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { satoshiFont } from '@/lib/constants/fonts';
import { AnimatedCollapsibleRef } from '@/components/Shared/molecules/AnimatedCollapsible';
import { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { transactionTypes } from '@/lib/constants/transactionTypes';
import { router } from 'expo-router';

export function BudgetCategorySetup() {
    const collapsibleRef = useRef<AnimatedCollapsibleRef>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const footerOpacity = useSharedValue(1);

    const handleToggle = () => {
        collapsibleRef.current?.toggle();
        setIsOpen(!isOpen);
    };

    React.useEffect(() => {
        footerOpacity.value = withTiming(isOpen ? 0 : 1, { duration: 300 });
    }, [isOpen, footerOpacity]);

    const footerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: footerOpacity.value,
        height: footerOpacity.value === 0 ? 0 : undefined,
    }));

    return (
        <View className='flex flex-col space-y-2.5 bg-purple-50 rounded-3xl border border-purple-100 p-5'>
            <View className='flex-row justify-between items-center'>
                <Text className='text-base text-black' style={satoshiFont.satoshiBold}>
                    Fixed
                </Text>

                <View className='flex-row items-center'>
                    <Text
                        className='text-sm text-purple-500 w-20 text-right'
                        style={satoshiFont.satoshiBlack}
                    >
                        {formatCurrencyRounded(100, 'GHS')}
                    </Text>
                </View>
            </View>

            <View className='h-[1px] border-b border-purple-100 w-full' />

            <View className='flex flex-col'>
                {transactionTypes.map((transaction, idx) => (
                    <React.Fragment key={idx}>
                        <View
                            className={`flex-row justify-between items-center ${
                                idx === transactionTypes.length - 1 ? 'pt-2.5 pb-1' : 'py-2.5'
                            }`}
                        >
                            <View className='flex-row items-center flex-1 mr-4'>
                                <Text
                                    className='text-sm text-black flex-1'
                                    style={satoshiFont.satoshiBold}
                                    numberOfLines={1}
                                    ellipsizeMode='tail'
                                >
                                    {transaction.replace(' ', '   ')}
                                </Text>
                            </View>

                            <TouchableOpacity
                                className='flex-row items-center self-start bg-purple-100 px-2.5 py-1 rounded-lg'
                                onPress={() =>
                                    router.push({
                                        pathname: '/plans/set-category-amount',
                                        params: {
                                            category: transaction,
                                            currentAmount: '0',
                                        },
                                    })
                                }
                            >
                                <Text
                                    className='text-sm text-purple-500'
                                    style={satoshiFont.satoshiBlack}
                                >
                                    {formatCurrencyRounded(0, 'GHS')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {idx < transactionTypes.length - 1 && (
                            <View className='h-[0.5px] border-b border-purple-100 w-full' />
                        )}
                    </React.Fragment>
                ))}
            </View>
        </View>
    );
}
