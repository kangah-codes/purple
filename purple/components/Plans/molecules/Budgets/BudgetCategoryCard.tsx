import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from '@/components/Shared/styled';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { satoshiFont } from '@/lib/constants/fonts';
import {
    AnimatedCollapsible,
    AnimatedCollapsibleRef,
} from '@/components/Shared/molecules/AnimatedCollapsible';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { AnimatedChevron } from './AnimatedChevron';
import { CollapsedFooter } from './CollapsedFooter';

interface BudgetCategoryCardProps {
    title: string;
    transactionTypes: string[];
}

export function BudgetCategoryCard({ title, transactionTypes }: BudgetCategoryCardProps) {
    const collapsibleRef = useRef<AnimatedCollapsibleRef>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const totalItems = transactionTypes.length;
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
                        {formatCurrencyRounded(100, 'GHS')}
                    </Text>

                    <Text
                        className='text-sm text-purple-500 w-20 text-right'
                        style={satoshiFont.satoshiBold}
                    >
                        {formatCurrencyRounded(100, 'GHS')}
                    </Text>
                </View>
            </TouchableOpacity>

            <View className='h-[1px] border-b border-purple-100 w-full' />

            <AnimatedCollapsible
                ref={collapsibleRef}
                defaultOpen={false}
                onOpen={() => setIsOpen(true)}
                onClose={() => setIsOpen(false)}
            >
                <View className='flex flex-col'>
                    {transactionTypes.map((transaction, idx) => (
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
                                        style={[satoshiFont.satoshiBold, { minWidth: 80 }]}
                                    >
                                        {formatCurrencyRounded(10042, 'GHS')}
                                    </Text>
                                    <Text
                                        className='text-sm text-purple-500 text-right'
                                        style={[satoshiFont.satoshiBold, { minWidth: 80 }]}
                                    >
                                        {formatCurrencyRounded(1055430, 'GHS')}
                                    </Text>
                                </View>
                            </View>
                            {idx < transactionTypes.length - 1 && (
                                <View className='h-[0.5px] border-b border-purple-100 w-full' />
                            )}
                        </React.Fragment>
                    ))}
                </View>
            </AnimatedCollapsible>

            <Animated.View style={footerAnimatedStyle}>
                {!isOpen && <CollapsedFooter collapsibleRef={collapsibleRef} count={totalItems} />}
            </Animated.View>
        </View>
    );
}
