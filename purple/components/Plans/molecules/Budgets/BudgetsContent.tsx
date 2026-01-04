import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import { addMonths, differenceInMonths, format, startOfMonth } from 'date-fns';
import { SafeAreaView, View, ScrollView } from '@/components/Shared/styled';
import BudgetSummary from './BudgetSummary';
import BudgetSummarySkeleton from './BudgetSummarySkeleton';
import CreateBudget from './CreateBudget';
import NoBudget from './NoBudget';
import BudgetPaceBanner from './BudgetPaceBanner';
import tw from 'twrnc';
import MonthCard from './MonthCard';
import { useBudgetForMonth, useBudgetPaceInsight, usePrefetchBudgetsForMonths } from '../../hooks';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';

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

function BudgetContentForMonth({ month }: { month: Date }) {
    const monthNumber = month.getMonth() + 1;
    const year = month.getFullYear();
    const { data, isLoading, isFetching, isFetched, refetch } = useBudgetForMonth(
        monthNumber,
        year,
    );

    // If react-query is configured to keep previous data, we can momentarily
    // see the prior month's budget result while the new month is fetching.
    // Guard against that to avoid flashing CreateBudget/NoBudget incorrectly.
    const expectedMonthName = format(month, 'MMMM');
    const budgetForThisMonth =
        data?.data && data.data.month === expectedMonthName && data.data.year === year
            ? data.data
            : null;

    const hasBudget = budgetForThisMonth;
    const isPastMonth = startOfMonth(month).getTime() < startOfMonth(new Date()).getTime();
    const paceInsight = useBudgetPaceInsight(hasBudget ?? null, month);

    useRefreshOnFocus(refetch);

    // Default to skeleton until this month's query has completed at least once.
    // This prevents brief flashes of CreateBudget/NoBudget while swiping.
    if (!isFetched || isLoading || (isFetching && !budgetForThisMonth)) {
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
            >
                {hasBudget ? (
                    <BudgetSummary budget={hasBudget} />
                ) : isPastMonth ? (
                    <NoBudget />
                ) : (
                    <CreateBudget />
                )}
            </ScrollView>
        </View>
    );
}

interface BudgetsScreenProps {
    currentDate: Date;
    onMonthChange?: (date: Date) => void;
    availableMonths?: Date[];
    renderContent?: (month: Date) => React.ReactNode;
}

export default function BudgetsContent({
    currentDate,
    onMonthChange,
    availableMonths: _availableMonths,
    renderContent,
}: BudgetsScreenProps) {
    const pagerRef = useRef<PagerView>(null);
    // @ts-expect-error ignore
    const monthScrollRef = useRef<ScrollView>(null);
    const [baseDate, setBaseDate] = useState(currentDate);
    const [isInitialized, setIsInitialized] = useState(false);

    // track prop changes separately so internal swipes dont get overwritten
    // when the parent doesnt update currentDate
    const lastPropDateRef = useRef(currentDate);

    // prevent handling synthetic page events caused by recentering
    const isRecenteringRef = useRef(false);

    void _availableMonths;

    const monthNavMonths = useMemo(() => {
        const months = Array.from({ length: NAV_RANGE * 2 + 1 }, (_, i) =>
            addMonths(baseDate, i - NAV_RANGE),
        );
        console.log('[DEBUG monthNavMonths] Recalculated, baseDate:', format(baseDate, 'MMM yyyy'));
        return months;
    }, [baseDate]);

    const pagerMonths = useMemo(() => {
        const months = Array.from({ length: PAGER_RANGE * 2 + 1 }, (_, i) =>
            addMonths(baseDate, i - PAGER_RANGE),
        );
        console.log(
            '[DEBUG pagerMonths] Recalculated, baseDate:',
            format(baseDate, 'MMM yyyy'),
            'Range:',
            format(months[0], 'MMM yyyy'),
            '-',
            format(months[months.length - 1], 'MMM yyyy'),
        );
        return months;
    }, [baseDate]);

    usePrefetchBudgetsForMonths(pagerMonths, { enabled: isInitialized, staleTimeMs: 60_000 });

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
        console.log(
            '[DEBUG useEffect currentDate] Prop changed, monthDiff:',
            monthDiff,
            'from',
            format(lastPropDateRef.current, 'MMM yyyy'),
            'to',
            format(currentDate, 'MMM yyyy'),
        );

        if (monthDiff !== 0) {
            console.log(
                '[DEBUG useEffect currentDate] Applying prop change - updating baseDate and recentering',
            );
            lastPropDateRef.current = currentDate;
            setBaseDate(currentDate);
            pagerRef.current?.setPageWithoutAnimation(PAGER_CENTER_INDEX);
            scrollMonthChipsToCenter(true);
        }
    }, [currentDate, isInitialized, scrollMonthChipsToCenter]);

    const goToMonth = useCallback(
        (monthIndex: number) => {
            if (monthIndex < 0 || monthIndex >= monthNavMonths.length) return;

            const delta = monthIndex - NAV_RANGE;
            if (delta === 0) return;

            // animate pager to the target month within the window
            pagerRef.current?.setPage(PAGER_CENTER_INDEX + delta);
        },
        [monthNavMonths.length],
    );

    const handlePageSelected = useCallback(
        (e: { nativeEvent: { position: number } }) => {
            console.log(
                '[DEBUG handlePageSelected] START - position:',
                e.nativeEvent.position,
                'isRecentering:',
                isRecenteringRef.current,
            );

            if (isRecenteringRef.current) {
                console.log('[DEBUG handlePageSelected] BLOCKED - currently recentering');
                return;
            }

            const position = e.nativeEvent.position;
            const delta = position - PAGER_CENTER_INDEX;
            if (delta === 0) {
                console.log('[DEBUG handlePageSelected] SKIPPED - already at center');
                return;
            }

            const selectedDate = addMonths(baseDate, delta);
            console.log(
                '[DEBUG handlePageSelected] Swiped delta:',
                delta,
                'from',
                format(baseDate, 'MMM yyyy'),
                'to',
                format(selectedDate, 'MMM yyyy'),
            );

            onMonthChange?.(selectedDate);
            console.log('[DEBUG handlePageSelected] Called onMonthChange');

            // recenter to keep the window small and swipable forever
            isRecenteringRef.current = true;
            console.log(
                '[DEBUG handlePageSelected] Set isRecenteringRef = true, scheduling recenter',
            );

            setTimeout(() => {
                console.log(
                    '[DEBUG handlePageSelected] TIMEOUT - Recentering pager to index',
                    PAGER_CENTER_INDEX,
                );
                pagerRef.current?.setPageWithoutAnimation(PAGER_CENTER_INDEX);

                // Wait for next frame to ensure pager position update completes
                requestAnimationFrame(() => {
                    console.log('[DEBUG handlePageSelected] RAF - Updating baseDate');
                    setBaseDate(selectedDate);
                    console.log('[DEBUG handlePageSelected] RAF - Called setBaseDate');

                    isRecenteringRef.current = false;
                    console.log('[DEBUG handlePageSelected] RAF - Set isRecenteringRef = false');
                });
            }, 0);

            scrollMonthChipsToCenter(true);
        },
        [baseDate, onMonthChange, scrollMonthChipsToCenter],
    );

    const renderPageContent = useCallback(
        (index: number) => {
            const month = pagerMonths[index];
            const distanceFromCenter = Math.abs(index - PAGER_CENTER_INDEX);
            const willMount = distanceFromCenter <= CONTENT_MOUNT_RANGE;

            console.log(
                '[DEBUG renderPageContent] Index:',
                index,
                'Month:',
                month ? format(month, 'MMM yyyy') : 'null',
                'Distance:',
                distanceFromCenter,
                'WillMount:',
                willMount,
                'isRecentering:',
                isRecenteringRef.current,
            );

            if (!month) return <View key={index} className='w-full h-full' />;

            // only mount content close to the visible page
            // everything else is a lightweight placeholder
            if (!willMount) {
                return <View key={index} className='w-full h-full' />;
            }

            if (renderContent) {
                return renderContent(month);
            }

            return <BudgetContentForMonth key={index} month={month} />;
        },
        [renderContent, pagerMonths],
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
