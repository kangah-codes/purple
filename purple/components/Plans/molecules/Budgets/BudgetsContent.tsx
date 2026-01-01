import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import { addMonths, subMonths, differenceInMonths, format } from 'date-fns';
import { SafeAreaView, View, ScrollView } from '@/components/Shared/styled';
import BudgetSummary from './BudgetSummary';
import BudgetSummarySkeleton from './BudgetSummarySkeleton';
import CreateBudget from './CreateBudget';
import tw from 'twrnc';
import MonthCard from './MonthCard';
import { useBudgetForMonth } from '../../hooks';

const { width: screenWidth } = Dimensions.get('window');
const MONTH_CARD_WIDTH = 72;
const MONTH_CARD_SPACING = 12;
const TOTAL_PAGES = 1000;
const CENTER_INDEX = 500;

function BudgetContentForMonth({ month }: { month: Date }) {
    const monthNumber = month.getMonth() + 1;
    const year = month.getFullYear();
    const { data, isLoading } = useBudgetForMonth(monthNumber, year);

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

    const hasBudget = data?.data;

    return (
        <ScrollView
            className='w-full h-full'
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[tw`flex-grow`]}
        >
            {hasBudget ? <BudgetSummary budget={data.data} /> : <CreateBudget />}
        </ScrollView>
    );
}

interface BudgetsScreenProps {
    currentDate: Date;
    onMonthChange: (date: Date) => void;
    availableMonths?: Date[]; // Made optional since we generate our own 5-month range
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
    const initialDateRef = useRef(currentDate);

    const [activeIndex, setActiveIndex] = useState(CENTER_INDEX);
    const [baseDate, setBaseDate] = useState(currentDate);
    const [isInitialized, setIsInitialized] = useState(false);

    void _availableMonths;

    // Generate 5 months with base date in the middle
    const displayedMonths = [
        subMonths(baseDate, 2),
        subMonths(baseDate, 1),
        baseDate,
        addMonths(baseDate, 1),
        addMonths(baseDate, 2),
    ];

    useEffect(() => {
        if (isInitialized) return;

        setBaseDate(currentDate);
        const diff = differenceInMonths(currentDate, initialDateRef.current);
        const startIndex = CENTER_INDEX + diff;

        setActiveIndex(startIndex);
        setIsInitialized(true);

        setTimeout(() => {
            pagerRef.current?.setPageWithoutAnimation(startIndex);
            const offsetX = Math.max(
                0,
                2 * (MONTH_CARD_WIDTH + MONTH_CARD_SPACING) -
                    screenWidth / 2 +
                    MONTH_CARD_WIDTH / 2,
            );
            monthScrollRef.current?.scrollTo({ x: offsetX, animated: false });
        }, 100);
    }, [isInitialized]);

    useEffect(() => {
        if (!isInitialized) return;

        if (differenceInMonths(currentDate, baseDate) !== 0) {
            const diff = differenceInMonths(currentDate, initialDateRef.current);
            const newIndex = CENTER_INDEX + diff;

            setBaseDate(currentDate);
            setActiveIndex(newIndex);
            pagerRef.current?.setPage(newIndex);

            const offsetX = Math.max(
                0,
                2 * (MONTH_CARD_WIDTH + MONTH_CARD_SPACING) -
                    screenWidth / 2 +
                    MONTH_CARD_WIDTH / 2,
            );
            monthScrollRef.current?.scrollTo({ x: offsetX, animated: true });
        }
    }, [currentDate, isInitialized]);

    const goToMonth = useCallback(
        (monthIndex: number) => {
            if (monthIndex >= 0 && monthIndex < displayedMonths.length) {
                const selectedDate = displayedMonths[monthIndex];
                const diff = differenceInMonths(selectedDate, initialDateRef.current);
                const newIndex = CENTER_INDEX + diff;

                setBaseDate(selectedDate);
                setActiveIndex(newIndex);
                onMonthChange(selectedDate);
                pagerRef.current?.setPage(newIndex);

                const offsetX = Math.max(
                    0,
                    2 * (MONTH_CARD_WIDTH + MONTH_CARD_SPACING) -
                        screenWidth / 2 +
                        MONTH_CARD_WIDTH / 2,
                );
                monthScrollRef.current?.scrollTo({ x: offsetX, animated: true });
            }
        },
        [displayedMonths, onMonthChange],
    );

    const handlePageSelected = useCallback(
        (e: { nativeEvent: { position: number } }) => {
            const newIndex = e.nativeEvent.position;
            if (newIndex === activeIndex) return;

            const diff = newIndex - CENTER_INDEX;
            const selectedDate = addMonths(initialDateRef.current, diff);

            setActiveIndex(newIndex);
            setBaseDate(selectedDate);
            onMonthChange(selectedDate);

            const offsetX = Math.max(
                0,
                2 * (MONTH_CARD_WIDTH + MONTH_CARD_SPACING) -
                    screenWidth / 2 +
                    MONTH_CARD_WIDTH / 2,
            );
            monthScrollRef.current?.scrollTo({ x: offsetX, animated: true });
        },
        [activeIndex, onMonthChange],
    );

    const renderPageContent = useCallback(
        (index: number) => {
            if (Math.abs(index - activeIndex) > 2) {
                return <View key={index} className='w-full h-full' />;
            }

            const diff = index - CENTER_INDEX;
            const month = addMonths(initialDateRef.current, diff);

            if (renderContent) {
                return renderContent(month);
            }

            return <BudgetContentForMonth key={index} month={month} />;
        },
        [renderContent, activeIndex],
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
                    {displayedMonths.map((month, index) => (
                        <MonthCard
                            key={`${format(baseDate, 'yyyy-MM')}-${index}`}
                            month={month}
                            index={index}
                            isActive={index === 2}
                            goToMonth={goToMonth}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Swipeable Content */}
            <PagerView
                ref={pagerRef}
                style={[tw`flex-1 bg-white`]}
                initialPage={CENTER_INDEX}
                onPageSelected={handlePageSelected}
                orientation='horizontal'
                offscreenPageLimit={1}
            >
                {Array.from({ length: TOTAL_PAGES }).map((_, index) => (
                    <View key={index} className='flex-1'>
                        {renderPageContent(index)}
                    </View>
                ))}
            </PagerView>
        </SafeAreaView>
    );
}
