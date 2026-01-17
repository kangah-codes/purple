import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, RefreshControl } from 'react-native';
import PagerView from 'react-native-pager-view';
import { addMonths, differenceInMonths, format, startOfMonth } from 'date-fns';
import { SafeAreaView, View, ScrollView } from '@/components/Shared/styled';
import BudgetSummary from './BudgetSummary';
import BudgetSummarySkeleton from './BudgetSummarySkeleton';
import BudgetPaceBanner from './BudgetPaceBanner';
import tw from 'twrnc';
import MonthCard from './MonthCard';
import { useBudgetForMonth, useBudgetPaceInsight, usePrefetchBudgetsForMonths } from '../../hooks';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import CreateBudget from './CreateBudget';
import NoBudget from './NoBudget';
import { useQueryClient } from 'react-query';

const { width: screenWidth } = Dimensions.get('window');
const MONTH_CARD_WIDTH = 72;
const MONTH_CARD_SPACING = 12;

// navigation range +/- months from current month
const NAV_RANGE = 2;

// preloads +/- 5 months (11 total) and recenters after each swipe
// increase/decrease this to control how far ahead/behind to load
const PAGER_RANGE = 5;
const PAGER_CENTER_INDEX = PAGER_RANGE;

// only mount expensive page content close to the visible month
const CONTENT_MOUNT_RANGE = 2;

interface BudgetsScreenProps {
    currentDate: Date;
    onMonthChange?: (date: Date) => void;
    availableMonths?: Date[];
    renderContent?: (month: Date) => React.ReactNode;
}

const BudgetContentForMonth = React.memo(function BudgetContentForMonth({ month }: { month: Date }) {
    const monthNumber = month.getMonth() + 1;
    const year = month.getFullYear();
    const { data, isLoading, refetch } = useBudgetForMonth(monthNumber, year);
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);

    const expectedMonthName = useMemo(() => format(month, 'MMMM'), [month]);
    const budgetForThisMonth = useMemo(() =>
        data?.data && data.data.month === expectedMonthName && data.data.year === year
            ? data.data
            : null,
        [data?.data, expectedMonthName, year]
    );

    const hasBudget = budgetForThisMonth;
    const isPastMonth = useMemo(() =>
        startOfMonth(month).getTime() < startOfMonth(new Date()).getTime(),
        [month]
    );
    const paceInsight = useBudgetPaceInsight(hasBudget ?? null, month);

    useRefreshOnFocus(refetch);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                refetch(),
                queryClient.invalidateQueries({ queryKey: ['transactions'] }),
                queryClient.invalidateQueries({ queryKey: ['budget-earned-income'] }),
                queryClient.invalidateQueries({ queryKey: ['budget-unbudgeted-categories'] }),
            ]);
        } finally {
            setRefreshing(false);
        }
    }, [refetch, queryClient]);

    // Only show skeleton on true initial load when there's no data at all
    // If we have any data (even stale/placeholder), show it immediately to avoid flashing
    const shouldShowSkeleton = isLoading && data === undefined;

    if (shouldShowSkeleton) {
        return (
            <ScrollView
                className='w-full h-full'
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[tw`flex-grow`]}
            >
                <BudgetSummarySkeleton />
            </ScrollView>
        );
    }

    return (
        <View className='bg-white flex-1'>
            <BudgetPaceBanner paceInsight={paceInsight} />
            <ScrollView
                className='w-full flex-1'
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[tw`flex-grow`]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor='#a855f7'
                        colors={['#a855f7']}
                    />
                }
            >
                {hasBudget ? (
                    <BudgetSummary budget={hasBudget} />
                ) : isPastMonth ? (
                    <NoBudget month={month} />
                ) : (
                    <CreateBudget />
                )}
                {/* <BudgetSummary budget={hasBudget} /> */}
            </ScrollView>
        </View>
    );
});

export default function BudgetsContent({
    currentDate,
    onMonthChange,
    availableMonths: _availableMonths,
    renderContent,
}: BudgetsScreenProps) {
    const pagerRef = useRef<PagerView>(null);
    // @ts-expect-error ignore
    const monthScrollRef = useRef<ScrollView>(null);

    // baseDate is the anchor for pagerMonths - only changes on recenter
    const [baseDate, setBaseDate] = useState(currentDate);
    // currentPageIndex tracks where we are in the pager without re-rendering pages
    const [currentPageIndex, setCurrentPageIndex] = useState(PAGER_CENTER_INDEX);
    const [isInitialized, setIsInitialized] = useState(false);

    // track prop changes separately so internal swipes dont get overwritten
    // when the parent doesnt update currentDate
    const lastPropDateRef = useRef(currentDate);

    // prevent handling synthetic page events caused by recentering
    const isRecenteringRef = useRef(false);

    void _availableMonths;

    // The currently visible month based on page position
    const visibleMonth = useMemo(() => {
        return addMonths(baseDate, currentPageIndex - PAGER_CENTER_INDEX);
    }, [baseDate, currentPageIndex]);

    const monthNavMonths = useMemo(() => {
        return Array.from({ length: NAV_RANGE * 2 + 1 }, (_, i) =>
            addMonths(visibleMonth, i - NAV_RANGE),
        );
    }, [visibleMonth]);

    const pagerMonths = useMemo(() => {
        return Array.from({ length: PAGER_RANGE * 2 + 1 }, (_, i) =>
            addMonths(baseDate, i - PAGER_RANGE),
        );
    }, [baseDate]);

    // Create a focused prefetch window of ±2 months from visible month
    // This ensures the most likely swipe destinations are always ready
    const prefetchWindow = useMemo(() => {
        const PREFETCH_RANGE = 2;
        return Array.from({ length: PREFETCH_RANGE * 2 + 1 }, (_, i) =>
            addMonths(visibleMonth, i - PREFETCH_RANGE),
        );
    }, [visibleMonth]);

    // Prefetch the focused window with shorter stale time for better freshness
    usePrefetchBudgetsForMonths(prefetchWindow, { enabled: isInitialized, staleTimeMs: 30_000 });

    const scrollMonthChipsToCenter = useCallback((animated: boolean) => {
        const offsetX = Math.max(
            0,
            NAV_RANGE * (MONTH_CARD_WIDTH + MONTH_CARD_SPACING) -
                screenWidth / 2 +
                MONTH_CARD_WIDTH / 2,
        );
        monthScrollRef.current?.scrollTo({ x: offsetX, animated });
    }, []);

    useEffect(() => {
        if (isInitialized) return;

        setBaseDate(currentDate);
        lastPropDateRef.current = currentDate;
        setIsInitialized(true);

        setTimeout(() => {
            pagerRef.current?.setPageWithoutAnimation(PAGER_CENTER_INDEX);
            scrollMonthChipsToCenter(false);
        }, 100);
    }, [currentDate, isInitialized, scrollMonthChipsToCenter]);

    useEffect(() => {
        if (!isInitialized) return;

        // only react to actual prop changes not internal swipes
        const monthDiff = differenceInMonths(currentDate, lastPropDateRef.current);

        if (monthDiff !== 0) {
            lastPropDateRef.current = currentDate;
            setBaseDate(currentDate);
            setCurrentPageIndex(PAGER_CENTER_INDEX);
            pagerRef.current?.setPageWithoutAnimation(PAGER_CENTER_INDEX);
            scrollMonthChipsToCenter(true);
        }
    }, [currentDate, isInitialized, scrollMonthChipsToCenter]);

    const goToMonth = useCallback(
        (monthIndex: number) => {
            if (monthIndex < 0 || monthIndex >= monthNavMonths.length) return;

            const delta = monthIndex - NAV_RANGE;
            if (delta === 0) return;

            // Calculate the target page index based on current position
            const targetPageIndex = currentPageIndex + delta;
            pagerRef.current?.setPage(targetPageIndex);
        },
        [monthNavMonths.length, currentPageIndex],
    );

    const handlePageSelected = useCallback(
        (e: { nativeEvent: { position: number } }) => {
            if (isRecenteringRef.current) {
                return;
            }

            const position = e.nativeEvent.position;

            // Update current page index (doesn't cause pagerMonths recalculation)
            setCurrentPageIndex(position);

            const selectedDate = addMonths(baseDate, position - PAGER_CENTER_INDEX);
            onMonthChange?.(selectedDate);

            // Only recenter when getting close to the edges (within 2 pages)
            // This prevents unnecessary re-renders on most swipes
            const distanceToEdge = Math.min(position, PAGER_RANGE * 2 - position);
            const shouldRecenter = distanceToEdge <= 2;

            if (shouldRecenter) {
                // Need to recenter to keep infinite scroll working
                isRecenteringRef.current = true;

                // Wait for animation to settle before recentering
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setBaseDate(selectedDate);
                        setCurrentPageIndex(PAGER_CENTER_INDEX);
                        pagerRef.current?.setPageWithoutAnimation(PAGER_CENTER_INDEX);
                        isRecenteringRef.current = false;
                    });
                });
            }

            scrollMonthChipsToCenter(true);
        },
        [baseDate, onMonthChange, scrollMonthChipsToCenter],
    );

    const renderPageContent = useCallback(
        (index: number) => {
            const month = pagerMonths[index];
            // Use currentPageIndex instead of PAGER_CENTER_INDEX for mount range
            const distanceFromCurrent = Math.abs(index - currentPageIndex);
            const willMount = distanceFromCurrent <= CONTENT_MOUNT_RANGE;

            // Use stable key based on actual month/year to preserve component state
            const monthKey = month
                ? `${month.getFullYear()}-${month.getMonth()}`
                : `empty-${index}`;

            if (!month) return <View key={monthKey} className='w-full h-full' />;

            // only mount content close to the visible page
            // everything else is a lightweight placeholder
            if (!willMount) {
                return <View key={monthKey} className='w-full h-full' />;
            }

            if (renderContent) {
                return renderContent(month);
            }

            return <BudgetContentForMonth key={monthKey} month={month} />;
        },
        [renderContent, pagerMonths, currentPageIndex],
    );

    if (!isInitialized) {
        return (
            <SafeAreaView className='bg-white flex-1'>
                <ScrollView
                    className='flex-1'
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[tw`pb-20`]}
                >
                    <BudgetSummarySkeleton />
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className='bg-white flex-1'>
            {/* Month Navigation */}
            <View className='bg-white py-3 border-b border-purple-100'>
                <ScrollView
                    ref={monthScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[tw`px-5 items-center`]}
                    decelerationRate='fast'
                >
                    {monthNavMonths.map((month, index) => (
                        <MonthCard
                            key={`${format(baseDate, 'yyyy-MM')}-${index}`}
                            month={month}
                            index={index}
                            isActive={index === NAV_RANGE}
                            goToMonth={goToMonth}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Swipeable Content */}
            <PagerView
                ref={pagerRef}
                style={[tw`flex-1 bg-white`]}
                initialPage={PAGER_CENTER_INDEX}
                onPageSelected={handlePageSelected}
                orientation='horizontal'
                offscreenPageLimit={1}
            >
                {pagerMonths.map((_, index) => (
                    <View key={index} className='flex-1'>
                        {renderPageContent(index)}
                    </View>
                ))}
            </PagerView>
        </SafeAreaView>
    );
}
