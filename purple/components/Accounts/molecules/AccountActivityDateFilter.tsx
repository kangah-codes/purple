import { AnimatedPillSelect } from '@/components/Shared/molecules/AnimatedPillSelect';
import { Text, View } from '@/components/Shared/styled';
import { useTransactions } from '@/components/Transactions/hooks';
import { satoshiFont } from '@/lib/constants/fonts';
import { getDateRange } from '@/lib/utils/date';
import React, { useMemo } from 'react';
import { useAccountStore } from '../hooks';

type AccountDatePeriod = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
const datePeriods: AccountDatePeriod[] = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];

export default function AccountActivityDateFilter() {
    const { currentAccountRequestParams, setCurrentAccountRequestParams } = useAccountStore();
    // get the oldest transaction to use as reference for 'ALL' period
    const { data: oldestTransactionData } = useTransactions({
        requestQuery: {
            accountID: currentAccountRequestParams.accountID,
            sortOrder: 'asc',
            page_size: 1,
        },
    });
    const oldestTransactionDate = useMemo(() => {
        return oldestTransactionData?.data?.[0]?.created_at
            ? new Date(oldestTransactionData.data[0].created_at)
            : undefined;
    }, [oldestTransactionData?.data]);

    const handlePeriodChange = (period: AccountDatePeriod) => {
        try {
            const dateRange = getDateRange(period, oldestTransactionDate);
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
        <View className=''>
            <View className='px-[30px]'>
                <AnimatedPillSelect
                    options={datePeriods.map((p) => ({ label: p, value: p }))}
                    selected={currentAccountRequestParams.currentSelection as AccountDatePeriod}
                    onChange={handlePeriodChange}
                    styling={{
                        pill: { backgroundColor: 'rgba(243, 232, 255, 0.5)' },
                        background: { backgroundColor: 'rgba(255, 255, 255, 0)' },
                        option: { padding: 12 },
                    }}
                    renderItem={(opt, isSelected) => (
                        <Text
                            style={[
                                satoshiFont.satoshiBlack,
                                { fontSize: 12 },
                                isSelected ? { color: '#8200db' } : { color: '#c27aff' },
                            ]}
                            className='tracking-tighter text-xs'
                        >
                            {opt.label}
                        </Text>
                    )}
                />
            </View>
        </View>
    );
}
