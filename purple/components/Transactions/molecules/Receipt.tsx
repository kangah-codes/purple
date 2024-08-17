import { Text, View } from '@/components/Shared/styled';
import { ArrowNarrowUpRightIcon } from '@/components/SVG/noscale';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import React from 'react';
import { StyleSheet } from 'react-native';

export const ReceiptHeader = React.memo(() => (
    <View className='w-full items-center mb-5'>
        <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg text-gray-700'>
            Receipt
        </Text>
    </View>
));

export const CategoryIcon = React.memo(() => (
    <View className='p-5 bg-red-100 rounded-full items-center justify-center mb-1.5'>
        <ArrowNarrowUpRightIcon width={16} height={16} style={styles.arrow} stroke='#B91C1C' />
    </View>
));

export const ReceiptDetail = React.memo(({ label, value }: any) => (
    <View className='w-full mb-5'>
        <Text style={GLOBAL_STYLESHEET.suprapower} className='text-sm text-black'>
            {label}
        </Text>
        <Text
            style={GLOBAL_STYLESHEET.interSemiBold}
            className='text-sm text-black tracking-tighter'
        >
            {value}
        </Text>
    </View>
));

const styles = StyleSheet.create({
    arrow: {
        position: 'absolute',
    },
});
