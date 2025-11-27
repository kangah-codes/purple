import React from 'react';
import { View, Text, TouchableOpacity } from '@/components/Shared/styled';
import { ChevronDownIcon } from '@/components/SVG/icons/16x16';
import { satoshiFont } from '@/lib/constants/fonts';
import { AnimatedCollapsibleRef } from '@/components/Shared/molecules/AnimatedCollapsible';

interface CollapsedFooterProps {
    count: number;
    collapsibleRef: React.RefObject<AnimatedCollapsibleRef>;
}

export function CollapsedFooter({ count, collapsibleRef }: CollapsedFooterProps) {
    const handlePress = () => collapsibleRef.current?.open();

    return (
        <TouchableOpacity
            className='flex-row items-center flex'
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={{ transform: [{ rotate: '0deg' }] }}>
                <ChevronDownIcon width={14} height={14} stroke='#9333EA' strokeWidth={2} />
            </View>
            <Text className='ml-2 text-xs text-purple-500' style={satoshiFont.satoshiBold}>
                Show {count} items
            </Text>
        </TouchableOpacity>
    );
}
