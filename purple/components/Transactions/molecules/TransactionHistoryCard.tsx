import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import { truncateStringIfLongerThan } from '@/lib/utils/string';
import {
    ArrowNarrowDownRightIcon,
    ArrowNarrowRightIcon,
    ArrowNarrowUpRightIcon,
} from '../../SVG/noscale';
import { LinearGradient, Text, TouchableOpacity, View } from '../../Shared/styled';
import { Transaction } from '../schema';
import { ChevronRightIcon } from '@/components/SVG/16x16';
import React, { useMemo } from 'react';
import { formatDateTime } from '@/lib/utils/date';

type TransactionHistoryCardProps = {
    data: Transaction;
    onPress: () => void;
    showTitle?: boolean;
};

const transferGradientColours = ['#c084fc', '#9333ea'];
const debitGradientColours = ['#EF4444', '#B91C1C'];
const creditGradientColours = ['#34D399', '#059669'];

export default function TransactionHistoryCard({
    data,
    onPress,
    showTitle,
}: TransactionHistoryCardProps) {
    const date = useMemo(() => formatDateTime(data.CreatedAt), [data.CreatedAt]);

    return (
        <TouchableOpacity
            onPress={onPress}
            className='w-full py-3.5 flex flex-row items-center space-x-3.5'
        >
            <View className='relative items-center justify-center'>
                <LinearGradient
                    colors={
                        data.Type === 'debit'
                            ? debitGradientColours
                            : data.Type == 'credit'
                            ? creditGradientColours
                            : transferGradientColours
                    }
                    className='flex items-center justify-center rounded-xl h-10 w-10'
                    style={{
                        backgroundColor:
                            data.Type === 'debit'
                                ? '#FEE2E2'
                                : data.Type == 'credit'
                                ? 'rgb(220 252 231)'
                                : '#F3E8FF',
                    }}
                />
                {data.Type === 'debit' ? (
                    <ArrowNarrowUpRightIcon
                        width={16}
                        height={16}
                        style={{ position: 'absolute' }}
                        stroke={'#fff'}
                    />
                ) : data.Type == 'credit' ? (
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

            <View className='flex flex-row justify-between items-center flex-grow'>
                <View className='flex flex-col'>
                    {showTitle && (
                        <Text style={GLOBAL_STYLESHEET.gramatikaBlack} className='text-base'>
                            {truncateStringIfLongerThan(data.category, 30)}
                        </Text>
                    )}
                    <Text
                        style={GLOBAL_STYLESHEET.gramatikaMedium}
                        className='text-sm text-gray-500 tracking-tighter'
                    >
                        {date.date} • {date.time}
                    </Text>
                </View>

                <View className='flex flex-row space-x-2 items-center'>
                    <Text
                        style={{
                            ...GLOBAL_STYLESHEET.gramatikaBlack,
                            color: data.Type === 'debit' ? '#DC2626' : 'rgb(22 163 74)',
                        }}
                        className='text-sm'
                    >
                        {data.Type === 'debit' ? '-' : '+'}
                        {/* {JSON.stringify(data.account)} */}
                        {formatCurrencyAccurate(data.currency, data.amount)}
                    </Text>

                    <ChevronRightIcon stroke='#1F2937' />
                </View>
            </View>
        </TouchableOpacity>
    );
}

TransactionHistoryCard.defaultProps = {
    showTitle: true,
};
