import { ChevronRightIcon } from '@/components/SVG/16x16';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { formatDateTime } from '@/lib/utils/date';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { extractEmojiOrDefault, truncateStringIfLongerThan } from '@/lib/utils/string';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Text, TouchableOpacity, View } from '../../Shared/styled';
import { Transaction } from '../schema';
import { satoshiFont } from '@/lib/constants/fonts';

type TransactionHistoryCardProps = {
    data: Transaction;
    onPress: () => void;
    showTitle?: boolean;
};

export default function TransactionHistoryCard({
    data,
    onPress,
    showTitle = true,
}: TransactionHistoryCardProps) {
    const date = useMemo(() => formatDateTime(data.created_at), [data.created_at]);
    const showActionMenu = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, []);
    const getTransactionColour = (type: Transaction['type']) => {
        switch (type) {
            case 'debit':
                return '#e7000b';
            case 'credit':
                return '#00a63e';
            case 'transfer':
                return '#9810fa';
        }
    };

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
                className='relative items-center justify-center flex rounded-xl h-10 w-10 bg-purple-50'
            >
                <Text className='absolute text-lg'>
                    {extractEmojiOrDefault(data.category, '❔')}
                </Text>
            </View>

            <View className='flex flex-row justify-between items-center flex-grow'>
                <View className='flex flex-col'>
                    {showTitle && (
                        <Text style={satoshiFont.satoshiBlack} className='text-base'>
                            {truncateStringIfLongerThan(
                                data.category.includes(' ')
                                    ? data.category.split(' ').slice(1).join(' ')
                                    : data.category,
                                30,
                            )}
                        </Text>
                    )}
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-500'>
                        {date.date} • {date.time}
                    </Text>
                </View>

                <View className='flex flex-row space-x-2 items-center'>
                    <Text
                        style={[
                            satoshiFont.satoshiBlack,
                            { color: getTransactionColour(data.type) },
                        ]}
                        className='text-sm'
                    >
                        {data.type === 'debit' ? '-' : data.type === 'credit' ? '+' : ''}
                        {formatCurrencyRounded(data.amount, data.currency)}
                    </Text>

                    <ChevronRightIcon stroke='#9333ea' />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    categoryIcon: {
        // shadowColor: '#A855F7',
        // shadowOffset: {
        //     width: 0,
        //     height: 1,
        // },
        // shadowOpacity: 0.125,
        // shadowRadius: 80,
        // elevation: 3,
    },
});
