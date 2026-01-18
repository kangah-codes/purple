import { Text, View } from '@/components/Shared/styled';
import { Transaction } from '@/components/Transactions/schema';
import { satoshiFont } from '@/lib/constants/fonts';
import { eachMonthOfInterval, format, isSameMonth, startOfMonth, subMonths } from 'date-fns';
import React, { memo, useMemo } from 'react';
import { isTransferTransaction } from '@/components/Transactions/utils';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { usePreferences } from '@/components/Settings/hooks';

interface CashflowCardProps {
    currentDate: Date;
    allTransactions: Transaction[];
    oldestTransactionDate?: Date;
}

// TODO: figure out how to properly scale chart when we start seeing sufficiently large inflows/outflows
export default memo(function CashflowCard({
    currentDate,
    allTransactions,
    oldestTransactionDate,
}: CashflowCardProps) {
    const {
        preferences: { currency: userPreferenceCurrency },
    } = usePreferences();
    const stableTransactions = useMemo(() => allTransactions, [allTransactions]);

    const rawData = useMemo(() => {
        if (stableTransactions.length === 0) {
            return [];
        }

        const endMonth = currentDate;
        const startMonth = subMonths(startOfMonth(currentDate), 6);
        const effectiveStartMonth = oldestTransactionDate
            ? startOfMonth(oldestTransactionDate) > startMonth
                ? startOfMonth(oldestTransactionDate)
                : startMonth
            : startMonth;
        const allMonths = eachMonthOfInterval({ start: effectiveStartMonth, end: endMonth });

        const transactionsByMonth = new Map<string, Transaction[]>();
        for (const transaction of stableTransactions) {
            const monthKey = format(new Date(transaction.created_at), 'yyyy-MM');
            if (!transactionsByMonth.has(monthKey)) {
                transactionsByMonth.set(monthKey, []);
            }
            transactionsByMonth.get(monthKey)!.push(transaction);
        }

        const result = allMonths.map((month) => {
            const monthKey = format(month, 'yyyy-MM');
            const monthTransactions = transactionsByMonth.get(monthKey) || [];

            const inflow = monthTransactions
                .filter((t) => t.type === 'credit' && !isTransferTransaction(t))
                .reduce((sum, t) => sum + Number(t.amount), 0);

            const outflow = monthTransactions
                .filter((t) => t.type === 'debit' && !isTransferTransaction(t))
                .reduce((sum, t) => sum - Math.abs(Number(t.amount)), 0);

            return {
                label: format(month, 'MMM'),
                inflow,
                outflow,
            };
        });

        return result;
    }, [currentDate, oldestTransactionDate, stableTransactions]);

    const { netCashFlowCurrentMonth, avgCashFlowPerMonth, currentMonthCurrency } = useMemo(() => {
        if (rawData.length === 0)
            return {
                netCashFlowCurrentMonth: 0,
                avgCashFlowPerMonth: 0,
                currentMonthCurrency: userPreferenceCurrency,
            };

        // Get current month's data (last item in rawData)
        const currentMonthData = rawData[rawData.length - 1];
        const currentMonthNet = currentMonthData
            ? currentMonthData.inflow + currentMonthData.outflow
            : 0;

        // Calculate average cash flow across all months
        const totalNetCashFlow = rawData.reduce(
            (sum, month) => sum + (month.inflow + month.outflow),
            0,
        );
        const avgCashFlow = totalNetCashFlow / rawData.length;

        // Get currency from the first available transaction
        const currency =
            stableTransactions.length > 0 ? stableTransactions[0].currency : userPreferenceCurrency;

        return {
            netCashFlowCurrentMonth: currentMonthNet,
            avgCashFlowPerMonth: avgCashFlow,
            currentMonthCurrency: currency,
        };
    }, [rawData, stableTransactions, userPreferenceCurrency]);

    const netFlowColor = netCashFlowCurrentMonth > 0 ? '#00a63e' : '#EF4444';
    const avgFlowColor = avgCashFlowPerMonth > 0 ? '#00a63e' : '#EF4444';

    return (
        <View className='flex flex-col space-y-5'>
            <View className='flex flex-col space-y-2.5'>
                <View>
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-500'>
                        Net Cash Flow
                    </Text>
                </View>
                <View>
                    <Text
                        style={[satoshiFont.satoshiBlack, { color: netFlowColor }]}
                        className='text-2xl'
                    >
                        {formatCurrencyRounded(netCashFlowCurrentMonth, currentMonthCurrency)}
                    </Text>
                </View>
            </View>

            <View className='h-[1px] border-b border-purple-100' />

            <View className='flex flex-col space-y-2.5'>
                <View>
                    <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-500'>
                        Avg Cash Flow
                    </Text>
                </View>
                <View>
                    <Text
                        style={[satoshiFont.satoshiBlack, { color: avgFlowColor }]}
                        className='text-2xl'
                    >
                        {formatCurrencyRounded(avgCashFlowPerMonth, currentMonthCurrency)}
                    </Text>
                </View>
            </View>
        </View>
    );
});
