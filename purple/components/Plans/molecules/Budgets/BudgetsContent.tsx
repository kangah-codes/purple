import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import { format, addMonths, subMonths, differenceInMonths } from 'date-fns';
import { SafeAreaView, View, Text, ScrollView } from '@/components/Shared/styled';
import BudgetSummary from './BudgetSummary';
import tw from 'twrnc';
import MonthCard from './MonthCard';

const { width: screenWidth } = Dimensions.get('window');
const MONTH_CARD_WIDTH = 72;
const MONTH_CARD_SPACING = 12;
const TOTAL_PAGES = 1000;
const CENTER_INDEX = 500;

interface BudgetsScreenProps {
    currentDate: Date;
    onMonthChange: (date: Date) => void;
    availableMonths?: Date[]; // Made optional since we generate our own 5-month range
    renderContent?: (month: Date) => React.ReactNode;
}

export default function BudgetsContent({
    currentDate,
    onMonthChange,
    availableMonths: _availableMonths, // Renamed with underscore to indicate it's intentionally unused
    renderContent,
}: BudgetsScreenProps) {
    const pagerRef = useRef<PagerView>(null);
    // @ts-expect-error ignore
    const monthScrollRef = useRef<ScrollView>(null);
    const initialDateRef = useRef(currentDate);

    const [activeIndex, setActiveIndex] = useState(CENTER_INDEX);
    const [baseDate, setBaseDate] = useState(currentDate);
    const [isInitialized, setIsInitialized] = useState(false);

    // Suppress lint warning for intentionally unused parameter
    void _availableMonths;

    // Generate 5 months with base date in the middle
    const displayedMonths = [
        subMonths(baseDate, 2),
        subMonths(baseDate, 1),
        baseDate, // Base date in the middle (index 2)
        addMonths(baseDate, 1),
        addMonths(baseDate, 2),
    ];

    // Initialize component
    useEffect(() => {
        if (isInitialized) return;

        setBaseDate(currentDate);
        const diff = differenceInMonths(currentDate, initialDateRef.current);
        const startIndex = CENTER_INDEX + diff;

        setActiveIndex(startIndex);
        setIsInitialized(true);

        setTimeout(() => {
            pagerRef.current?.setPageWithoutAnimation(startIndex);
            // Center the scroll view on the middle month
            const offsetX = Math.max(
                0,
                2 * (MONTH_CARD_WIDTH + MONTH_CARD_SPACING) -
                    screenWidth / 2 +
                    MONTH_CARD_WIDTH / 2,
            );
            monthScrollRef.current?.scrollTo({ x: offsetX, animated: false });
        }, 100);
    }, [isInitialized]);

    // Sync with external currentDate changes
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

    // Handle month navigation
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

                // Center the scroll view on the middle month
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

            // Center the scroll view
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

    // Page content renderer
    const renderPageContent = useCallback(
        (index: number) => {
            // Virtualization
            if (Math.abs(index - activeIndex) > 2) {
                return <View key={index} className='w-full h-full' />;
            }

            const diff = index - CENTER_INDEX;
            const month = addMonths(initialDateRef.current, diff);

            if (renderContent) {
                return renderContent(month);
            }

            return (
                <ScrollView
                    // style={styles.pageContent}
                    className='w-full h-full'
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[tw`pb-20`]}
                >
                    <BudgetSummary />
                </ScrollView>
            );
        },
        [renderContent, BudgetSummary, activeIndex],
    );

    if (!isInitialized) {
        return (
            <SafeAreaView className='bg-white flex-1'>
                <View className='flex-1 items-center justify-center'>
                    <Text className='text-gray-500 text-sm font-medium'>Loading...</Text>
                </View>
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
