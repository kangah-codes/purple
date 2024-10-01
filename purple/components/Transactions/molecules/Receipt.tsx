import { Text, View } from '@/components/Shared/styled';
import {
    ArrowNarrowDownRightIcon,
    ArrowNarrowRightIcon,
    ArrowNarrowUpRightIcon,
} from '@/components/SVG/noscale';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Transaction } from '../schema';

export const ReceiptHeader = React.memo(() => (
    <View className='w-full items-center mb-5'>
        <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg text-gray-700'>
            Receipt
        </Text>
    </View>
));

const renderIcon = (type: Transaction['Type']) => {
    switch (type) {
        case 'debit':
            return {
                component: (
                    <ArrowNarrowUpRightIcon
                        width={16}
                        height={16}
                        style={styles.arrow}
                        stroke='#B91C1C'
                    />
                ),
                bgColor: '#FEE2E2',
            };
        case 'credit':
            return {
                component: (
                    <ArrowNarrowDownRightIcon
                        width={16}
                        height={16}
                        style={styles.arrow}
                        stroke='#047857'
                    />
                ),
                bgColor: '#D1FAE5',
            };
        case 'transfer':
            return {
                component: (
                    <ArrowNarrowRightIcon
                        width={16}
                        height={16}
                        style={styles.arrow}
                        stroke='#7C3AED'
                    />
                ),
                bgColor: '#F3E8FF',
            };
        default:
            return null;
    }
};

export const CategoryIcon = React.memo(({ type }: { type: Transaction['Type'] }) => {
    const icon = renderIcon(type);
    return (
        <View
            className='p-5 rounded-full items-center justify-center mb-1.5'
            style={{
                backgroundColor: icon?.bgColor,
            }}
        >
            {icon?.component}
        </View>
    );
});

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
