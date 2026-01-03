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
    const { data, isLoading, refetch } = useBudgetForMonth(monthNumber, year);
    const hasBudget = data?.data;
    const isPastMonth = startOfMonth(month).getTime() < startOfMonth(new Date()).getTime();
    const paceInsight = useBudgetPaceInsight(hasBudget ?? null, month);

    useRefreshOnFocus(refetch);

    if (isLoading) {
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
                    <BudgetSummary budget={data.data} />
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
        return Array.from({ length: NAV_RANGE * 2 + 1 }, (_, i) =>
            addMonths(baseDate, i - NAV_RANGE),
        );
    }, [baseDate]);

    const pagerMonths = useMemo(() => {
        return Array.from({ length: PAGER_RANGE * 2 + 1 }, (_, i) =>
            addMonths(baseDate, i - PAGER_RANGE),
        );
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
        if (differenceInMonths(currentDate, lastPropDateRef.current) !== 0) {
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
            if (isRecenteringRef.current) return;

            const position = e.nativeEvent.position;
            const delta = position - PAGER_CENTER_INDEX;
            if (delta === 0) return;

            const selectedDate = addMonths(baseDate, delta);
            setBaseDate(selectedDate);
            onMonthChange?.(selectedDate);

            // recenter to keep the window small and swipable forever
            isRecenteringRef.current = true;
            setTimeout(() => {
                pagerRef.current?.setPageWithoutAnimation(PAGER_CENTER_INDEX);
                isRecenteringRef.current = false;
            }, 0);

            scrollMonthChipsToCenter(true);
        },
        [baseDate, onMonthChange, scrollMonthChipsToCenter],
    );

    const renderPageContent = useCallback(
        (index: number) => {
            const month = pagerMonths[index];
            if (!month) return <View key={index} className='w-full h-full' />;

            // only mount content close to the visible page
            // everything else is a lightweight placeholder
            if (Math.abs(index - PAGER_CENTER_INDEX) > CONTENT_MOUNT_RANGE) {
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
