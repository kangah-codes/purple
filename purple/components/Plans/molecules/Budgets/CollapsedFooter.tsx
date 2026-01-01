import React from 'react';
import { View, Text, TouchableOpacity } from '@/components/Shared/styled';
import { ChevronDownIcon } from '@/components/SVG/icons/16x16';
import { satoshiFont } from '@/lib/constants/fonts';
import { AnimatedCollapsibleRef } from '@/components/Shared/molecules/AnimatedCollapsible';
import { formatCurrencyRounded } from '@/lib/utils/number';

interface CollapsedFooterProps {
    count: number;
    collapsibleRef: React.RefObject<AnimatedCollapsibleRef>;
    totalBudget?: number;
    totalLeft?: number;
    currency?: string;
}

export function CollapsedFooter({
    count,
    collapsibleRef,
    totalBudget,
    totalLeft,
    currency = 'GHS',
}: CollapsedFooterProps) {
    const handlePress = () => collapsibleRef.current?.open();

    return (
        <TouchableOpacity
            className='flex-row items-center justify-between flex-1'
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View className='flex-row items-center'>
                <View style={{ transform: [{ rotate: '0deg' }] }}>
                    <ChevronDownIcon width={14} height={14} stroke='#9333EA' strokeWidth={2} />
                </View>
                <Text className='ml-2 text-xs text-purple-500' style={satoshiFont.satoshiBold}>
                    Show {count} items
                </Text>
            </View>

            {totalBudget !== undefined && totalLeft !== undefined && (
                <View className='flex-row items-center'>
                    <Text
                        className='text-xs text-black mr-8 w-20 text-right'
                        style={satoshiFont.satoshiBold}
                    >
                        {formatCurrencyRounded(totalBudget, currency)}
                    </Text>
                    <Text
                        className='text-xs text-purple-500 w-20 text-right'
                        style={satoshiFont.satoshiBold}
                    >
                        {formatCurrencyRounded(totalLeft, currency)}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}
