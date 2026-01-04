import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from '@/components/Shared/styled';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { satoshiFont } from '@/lib/constants/fonts';
import {
    AnimatedCollapsible,
    AnimatedCollapsibleRef,
} from '@/components/Shared/molecules/AnimatedCollapsible';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { AnimatedChevron } from './AnimatedChevron';
import { BudgetCategoryLimit } from '@/lib/services/BudgetSQLiteService';
import { CollapsedFooter } from './CollapsedFooter';

interface BudgetCategoryCardProps {
    title: string;
    transactionTypes: string[];
    categoryLimits?: BudgetCategoryLimit[];
    currency?: string;
}

export function BudgetCategoryCard({
    title,
    transactionTypes,
    categoryLimits = [],
    currency,
}: BudgetCategoryCardProps) {
    const collapsibleRef = useRef<AnimatedCollapsibleRef>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const totalItems = transactionTypes.length;
    const footerOpacity = useSharedValue(1);
    const totalBudget = categoryLimits.reduce((sum, cl) => sum + cl.limit_amount, 0);
    const totalLeft = categoryLimits.reduce(
        (sum, cl) => sum + (cl.limit_amount - cl.spent_amount),
        0,
    );

    const handleToggle = () => {
        collapsibleRef.current?.toggle();
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        footerOpacity.value = withTiming(isOpen ? 0 : 1, { duration: 300 });
    }, [isOpen, footerOpacity]);

    const footerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: footerOpacity.value,
        height: footerOpacity.value === 0 ? 0 : undefined,
        paddingBottom: footerOpacity.value === 0 ? 5 : 20,
    }));

    return (
        <View className='flex flex-col space-y-2.5 bg-purple-50 rounded-3xl border border-purple-100 px-5 pt-5'>
            <TouchableOpacity
                className='flex-row justify-between items-center'
                onPress={handleToggle}
                activeOpacity={0.7}
            >
                <View className='flex-row items-center flex-1'>
                    <AnimatedChevron isOpen={isOpen} />
                    <Text className='text-sm text-black ml-2' style={satoshiFont.satoshiBold}>
                        {title}
                    </Text>
                </View>

                <View className='flex-row items-center'>
                    <Text
                        className='text-sm text-black w-20 text-right mr-8'
                        style={satoshiFont.satoshiBold}
                    >
                        {formatCurrencyRounded(totalBudget, currency)}
                    </Text>

                    <Text
                        className='text-sm text-purple-500 w-20 text-right'
                        style={satoshiFont.satoshiBold}
                    >
                        {formatCurrencyRounded(totalLeft, currency)}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* <View className='h-[1px] border-b border-purple-100 w-full' /> */}

            <AnimatedCollapsible
                ref={collapsibleRef}
                defaultOpen={false}
                onOpen={() => setIsOpen(true)}
                onClose={() => setIsOpen(false)}
            >
                <View className='flex flex-col'>
                    {transactionTypes.map((transaction, idx) => {
                        const categoryLimit = categoryLimits.find(
                            (cl) => cl.category === transaction,
                        );
                        const limitAmount = categoryLimit?.limit_amount || 0;
                        const spentAmount = categoryLimit?.spent_amount || 0;
                        const remainingAmount = limitAmount - spentAmount;

                        return (
                            <React.Fragment key={idx}>
                                <View className='flex-row justify-between items-center py-2.5'>
                                    <View className='flex-row items-center flex-1 mr-4'>
                                        <Text
                                            className='text-sm text-black flex-1'
                                            style={satoshiFont.satoshiBold}
                                            numberOfLines={1}
                                            ellipsizeMode='tail'
                                        >
                                            {transaction}
                                        </Text>
                                    </View>

                                    <View className='flex-row items-center flex-shrink-0'>
                                        <Text
                                            className='text-sm text-black text-right mr-8'
                                            style={[satoshiFont.satoshiBlack, { minWidth: 80 }]}
                                        >
                                            {formatCurrencyRounded(limitAmount, currency)}
                                        </Text>
                                        <Text
                                            className='text-sm text-purple-500 text-right'
                                            style={[satoshiFont.satoshiBlack, { minWidth: 80 }]}
                                        >
                                            {formatCurrencyRounded(remainingAmount, currency)}
                                        </Text>
                                    </View>
                                </View>
                                {idx < transactionTypes.length - 1 && (
                                    <View className='h-[0.5px] border-b border-purple-100 w-full' />
                                )}
                            </React.Fragment>
                        );
                    })}
                </View>
            </AnimatedCollapsible>

            <Animated.View style={footerAnimatedStyle}>
                {!isOpen && (
                    <CollapsedFooter
                        collapsibleRef={collapsibleRef}
                        count={totalItems}
                        totalBudget={totalBudget}
                        totalLeft={totalLeft}
                        currency={currency}
                    />
                )}
            </Animated.View>
        </View>
    );
}
