import DateRangePicker from '@/components/Shared/atoms/DateRangePicker';
import { View } from '@/components/Shared/styled';
import { useTransactionStore } from '@/components/Transactions/hooks';
import React, { useCallback, useState, useEffect } from 'react';

interface DateRange {
    startDate: string | null;
    endDate: string | null;
}

export default function TransactionDateFilter() {
    const { pendingTransactionsFilter, setPendingTransactionsFilter } = useTransactionStore();
    const [startDate, setStartDate] = useState<Date | null>(
        pendingTransactionsFilter.start_date
            ? new Date(pendingTransactionsFilter.start_date)
            : null,
    );
    const [endDate, setEndDate] = useState<Date | null>(
        pendingTransactionsFilter.end_date ? new Date(pendingTransactionsFilter.end_date) : null,
    );

    // Reset local state when global filter is reset
    useEffect(() => {
        setStartDate(
            pendingTransactionsFilter.start_date
                ? new Date(pendingTransactionsFilter.start_date)
                : null,
        );
        setEndDate(
            pendingTransactionsFilter.end_date
                ? new Date(pendingTransactionsFilter.end_date)
                : null,
        );
    }, [pendingTransactionsFilter.start_date, pendingTransactionsFilter.end_date]);

    const handleDateRangeChange = useCallback(
        (dateRange: DateRange) => {
            if (dateRange.startDate) {
                setStartDate(new Date(dateRange.startDate));
            }
            if (dateRange.endDate) {
                setEndDate(new Date(dateRange.endDate));
            }
        },
        [setStartDate, setEndDate],
    );

    // Update global filter when local dates change
    useEffect(() => {
        const newStartDate = startDate?.toISOString();
        const newEndDate = endDate?.toISOString();

        // Only update if dates have changed
        if (
            newStartDate !== pendingTransactionsFilter.start_date ||
            newEndDate !== pendingTransactionsFilter.end_date
        ) {
            setPendingTransactionsFilter({
                ...pendingTransactionsFilter,
                start_date: newStartDate,
                end_date: newEndDate,
            });
        }
    }, [startDate, endDate, pendingTransactionsFilter, setPendingTransactionsFilter]);

    return (
        <View className='bg-white'>
            <DateRangePicker
                onDateRangeChange={handleDateRangeChange}
                initialDateRange={{
                    startDate: startDate?.toISOString() || null,
                    endDate: endDate?.toISOString() || null,
                }}
                maxDate={new Date().toISOString()}
            />
        </View>
    );
}
