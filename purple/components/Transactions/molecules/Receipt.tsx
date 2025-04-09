import { Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import React from 'react';
import { StyleSheet } from 'react-native';

export const ReceiptHeader = React.memo(() => (
    <View className='w-full items-center mb-5'>
        <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-lg text-gray-700'>
            Receipt
        </Text>
    </View>
));

export const ReceiptDetail = React.memo(({ label, value }: any) => (
    <View className='w-full mb-5'>
        <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-sm text-black'>
            {label}
        </Text>
        <Text style={GLOBAL_STYLESHEET.satoshiMedium} className='text-sm text-black'>
            {value}
        </Text>
    </View>
));

const styles = StyleSheet.create({
    arrow: {
        position: 'absolute',
    },
});
