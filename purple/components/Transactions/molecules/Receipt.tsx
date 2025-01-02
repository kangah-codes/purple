import { LinearGradient, Text, View } from '@/components/Shared/styled';
import {
    ArrowNarrowDownRightIcon,
    ArrowNarrowRightIcon,
    ArrowNarrowUpRightIcon,
} from '@/components/SVG/noscale';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Transaction } from '../schema';

const transferGradientColours = ['#c084fc', '#9333ea'];
const debitGradientColours = ['#EF4444', '#B91C1C'];
const creditGradientColours = ['#34D399', '#059669'];

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
        <View className='relative items-center justify-center'>
            <LinearGradient
                colors={
                    type === 'debit'
                        ? debitGradientColours
                        : type == 'credit'
                        ? creditGradientColours
                        : transferGradientColours
                }
                className='flex items-center justify-center rounded-xl h-10 w-10'
                style={{
                    backgroundColor:
                        type === 'debit'
                            ? '#FEE2E2'
                            : type == 'credit'
                            ? 'rgb(220 252 231)'
                            : '#F3E8FF',
                }}
            />
            {type === 'debit' ? (
                <ArrowNarrowUpRightIcon
                    width={16}
                    height={16}
                    style={{ position: 'absolute' }}
                    stroke={'#fff'}
                />
            ) : type == 'credit' ? (
                <ArrowNarrowDownRightIcon
                    width={16}
                    height={16}
                    style={{ position: 'absolute' }}
                    stroke={'#fff'}
                />
            ) : (
                <ArrowNarrowRightIcon
                    width={16}
                    height={16}
                    style={{ position: 'absolute' }}
                    stroke='#fff'
                />
            )}
        </View>
    );
});

export const ReceiptDetail = React.memo(({ label, value }: any) => (
    <View className='w-full mb-5'>
        <Text style={GLOBAL_STYLESHEET.suprapower} className='text-sm text-black'>
            {label}
        </Text>
        <Text
            style={GLOBAL_STYLESHEET.monaSansSemiBold}
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
