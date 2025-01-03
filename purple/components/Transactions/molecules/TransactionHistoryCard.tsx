import { ChevronRightIcon } from '@/components/SVG/16x16';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { formatDateTime } from '@/lib/utils/date';
import { formatCurrencyAccurate, formatCurrencyRounded } from '@/lib/utils/number';
import { extractEmojiOrDefault, truncateStringIfLongerThan } from '@/lib/utils/string';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Text, TouchableOpacity, View } from '../../Shared/styled';
import { Transaction } from '../schema';

type TransactionHistoryCardProps = {
    data: Transaction;
    onPress: () => void;
    showTitle?: boolean;
};

export default function TransactionHistoryCard({
    data,
    onPress,
    showTitle,
}: TransactionHistoryCardProps) {
    const date = useMemo(() => formatDateTime(data.CreatedAt), [data.CreatedAt]);

    const showActionMenu = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, []);

    return (
        <TouchableOpacity
            onPress={onPress}
            className='w-full py-3.5 flex flex-row items-center space-x-3.5'
            activeOpacity={0.7}
            onLongPress={showActionMenu}
            delayLongPress={350}
        >
            <View
                style={styles.categoryIcon}
                className='relative items-center justify-center flex rounded-xl h-10 w-10 border border-purple-200 bg-purple-50'
            >
                <Text className='absolute text-lg'>
                    {extractEmojiOrDefault(data.category, '❔')}
                </Text>
            </View>

            <View className='flex flex-row justify-between items-center flex-grow'>
                <View className='flex flex-col'>
                    {showTitle && (
                        <Text style={GLOBAL_STYLESHEET.gramatikaBlack} className='text-base'>
                            {truncateStringIfLongerThan(
                                data.category.includes(' ')
                                    ? data.category.split(' ').slice(1).join(' ')
                                    : data.category,
                                30,
                            )}
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
                            color:
                                data.Type === 'debit'
                                    ? '#DC2626'
                                    : data.Type === 'credit'
                                    ? 'rgb(22 163 74)'
                                    : '#9333EA',
                        }}
                        className='text-sm'
                    >
                        {data.Type === 'debit' ? '-' : data.Type === 'credit' ? '+' : ''}
                        {formatCurrencyRounded(data.amount, data.currency)}
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

const styles = StyleSheet.create({
    categoryIcon: {
        shadowColor: '#A855F7',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.125,
        shadowRadius: 80,
        elevation: 3,
    },
});
