import DateRangePicker from '@/components/Shared/atoms/DateRangePicker';
import { View } from '@/components/Shared/styled';
import React, { useCallback, useState } from 'react';

interface DateRange {
    startDate: string | null;
    endDate: string | null;
}

export default function TransactionDateFilter() {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
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
