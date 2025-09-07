import { SafeAreaView, Text, View } from '@/components/Shared/styled';
import { useTransactions } from '@/components/Transactions/hooks';
import { satoshiFont } from '@/lib/constants/fonts';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import { addMonths, endOfMonth, format, isBefore, startOfMonth } from 'date-fns';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';
import MonthlyStatsPage from '../molecules/MonthlyStatsReport';
import ReportLoadingScreen from '../molecules/ReportLoadingScreen';
import StatsNavigationArea from '../molecules/StatsNavigationArea';

export default function StatsScreen() {
    const pagerRef = useRef<PagerView>(null);
    const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isInitialized, setIsInitialized] = useState(false);
    const {
        data: oldestTransaction,
        isLoading: isLoadingOldest,
        refetch: refetchOldestTransaction,
    } = useTransactions({
        requestQuery: {
            page_size: 1,
            sortOrder: 'asc',
        },
        options: {
            keepPreviousData: true,
        },
    });

    const earliestTransactionDate = useMemo(() => {
        const date = oldestTransaction?.data?.[0]?.created_at
            ? new Date(oldestTransaction.data[0].created_at)
            : new Date();
        return startOfMonth(date);
    }, [oldestTransaction?.data]);

    const availableMonths = useMemo(() => {
        if (isLoadingOldest) return [];

        const months: Date[] = [];
        const currentMonth = startOfMonth(new Date());
        let iterDate = earliestTransactionDate;

        while (!isBefore(currentMonth, iterDate)) {
            months.push(iterDate);
            iterDate = addMonths(iterDate, 1);
        }

        return months;
    }, [earliestTransactionDate, isLoadingOldest]);

    useEffect(() => {
        if (availableMonths.length === 0 || isInitialized) return;

        const now = new Date();
        const currentMonthKey = format(now, 'yyyy-MM');
        const currentMonthIdx = availableMonths.findIndex(
            (month) => format(month, 'yyyy-MM') === currentMonthKey,
        );

        if (currentMonthIdx !== -1) {
            setCurrentMonthIndex(currentMonthIdx);
            setCurrentDate(availableMonths[currentMonthIdx]);
            setIsInitialized(true);

            setTimeout(() => {
                pagerRef.current?.setPageWithoutAnimation(currentMonthIdx);
            }, 150);
        }
    }, [availableMonths, isInitialized]);

    const monthRange = useMemo(() => {
        if (!isInitialized || !currentDate) {
            return {
                start_date: new Date().toISOString(),
                end_date: new Date().toISOString(),
            };
        }

        return {
            start_date: startOfMonth(currentDate).toISOString(),
            end_date: endOfMonth(currentDate).toISOString(),
        };
    }, [currentDate, isInitialized]);

    const {
        refetch,
        data: monthlyTransactions,
        isLoading,
    } = useTransactions({
        requestQuery: {
            page_size: Infinity,
            ...monthRange,
        },
        options: {
            enabled: isInitialized,
            keepPreviousData: true,
        },
    });

    const { data: allHistoricalTransactions, refetch: refetchHistoricalTransactions } =
        useTransactions({
            requestQuery: {
                page_size: Infinity,
                // fetch from earliest transaction to now to cover all possible month views
                start_date: earliestTransactionDate.toISOString(),
                end_date: endOfMonth(new Date()).toISOString(),
            },
            options: {
                enabled: isInitialized,
                keepPreviousData: true,
            },
        });

    const stableHistoricalData = useMemo(
        () => allHistoricalTransactions?.data ?? [],
        [allHistoricalTransactions?.data],
    );
    const stableMonthlyData = useMemo(
        () => monthlyTransactions?.data ?? [],
        [monthlyTransactions?.data],
    );

    useRefreshOnFocus(refetch);
    useRefreshOnFocus(refetchHistoricalTransactions);
    useRefreshOnFocus(refetchOldestTransaction);

    const goToPreviousMonth = useCallback(() => {
        if (currentMonthIndex > 0) {
            pagerRef.current?.setPage(currentMonthIndex - 1);
        }
    }, [currentMonthIndex]);

    const goToNextMonth = useCallback(() => {
        if (currentMonthIndex < availableMonths.length - 1) {
            pagerRef.current?.setPage(currentMonthIndex + 1);
        }
    }, [currentMonthIndex, availableMonths.length]);

    const handlePageSelected = useCallback(
        (e: { nativeEvent: { position: number } }) => {
            const newIndex = e.nativeEvent.position;
            setCurrentMonthIndex(newIndex);
            setCurrentDate(availableMonths[newIndex]);
        },
        [availableMonths],
    );

    const navigationProps = useMemo(
        () => ({
            currentDate,
            currentMonthIndex,
            goToPreviousMonth,
            goToNextMonth,
            setCurrentMonthIndex,
            setCurrentDate,
            availableMonths,
        }),
        [currentDate, currentMonthIndex, goToPreviousMonth, goToNextMonth, availableMonths],
    );

    if (!isInitialized || (isLoadingOldest && !oldestTransaction)) return <ReportLoadingScreen />;

    if (availableMonths.length === 0) {
        return (
            <SafeAreaView className='relative h-full bg-white' style={styles.parentView}>
                <ExpoStatusBar style='dark' />
                <View className='flex-1 items-center justify-center'>
                    <Text style={satoshiFont.satoshiBold} className='text-lg'>
                        {isLoadingOldest ? 'Loading...' : 'No transaction data available'}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className='relative h-full bg-white' style={styles.parentView}>
            <ExpoStatusBar style='dark' />
            <StatsNavigationArea {...navigationProps} />
            <PagerView
                ref={pagerRef}
                style={styles.pagerView}
                // initialPage={0}
                onPageSelected={handlePageSelected}
                orientation='horizontal'
                overdrag
                scrollEnabled
            >
                {availableMonths.map((month, index) => (
                    <View key={format(month, 'yyyy-MM')} style={styles.page}>
                        {/* Only render the current month and adjacent months for better performance */}
                        {Math.abs(index - currentMonthIndex) <= 1 ? (
                            <MonthlyStatsPage
                                currentDate={month}
                                transactions={stableMonthlyData}
                                allHistoricalTransactions={stableHistoricalData}
                                oldestTransactionDate={earliestTransactionDate}
                                isLoading={isLoading && !monthlyTransactions}
                            />
                        ) : (
                            <ReportLoadingScreen showNavigation={false} />
                        )}
                    </View>
                ))}
            </PagerView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        paddingBottom: 100,
    },
    pagerView: {
        flex: 1,
    },
    page: {
        flex: 1,
    },
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
