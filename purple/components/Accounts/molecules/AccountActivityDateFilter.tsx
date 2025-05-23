import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useAccountStore } from '../hooks';
import { getDateRange } from '@/lib/utils/date';

type AccountDatePeriod = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
const datePeriods: AccountDatePeriod[] = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];

export default function AccountActivityDateFilter() {
    const { currentAccountRequestParams, setCurrentAccountRequestParams } = useAccountStore();

    const handlePeriodChange = async (period: AccountDatePeriod) => {
        try {
            const dateRange = getDateRange(period);
            setCurrentAccountRequestParams({
                ...currentAccountRequestParams,
                currentSelection: period,
                startDate: dateRange.startDate.toISOString(),
                endDate: dateRange.endDate.toISOString(),
            });
        } catch (error) {
            console.error('Error changing period:', error);
        }
    };

    return (
        <View className='flex flex-row justify-between items-center px-8'>
            {datePeriods.map((period) => (
                <TouchableOpacity
                    key={period}
                    style={[
                        styles.pill,
                        currentAccountRequestParams.currentSelection === period &&
                            styles.activePill,
                    ]}
                    className='rounded-full px-3 py-1'
                    onPress={() => handlePeriodChange(period)}
                >
                    <Text
                        style={[
                            satoshiFont.satoshiBold,
                            currentAccountRequestParams.currentSelection === period
                                ? styles.activeText
                                : styles.inactiveText,
                        ]}
                        className='text-xs tracking-tighter'
                    >
                        {period}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    pill: {
        backgroundColor: 'transparent',
    },
    activePill: {
        backgroundColor: 'rgba(243, 232, 255, 0.7)',
    },
    activeText: {
        color: '#9333EA',
    },
    inactiveText: {
        color: '#99a1af',
    },
});
