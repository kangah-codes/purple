import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import PagerView from 'react-native-pager-view';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { format, addMonths, subMonths, differenceInMonths } from 'date-fns';
import { SafeAreaView } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import BudgetSummary from '../Budgets/BudgetSummary';
import tw from 'twrnc';

const { width: screenWidth } = Dimensions.get('window');
const MONTH_CARD_WIDTH = 72;
const MONTH_CARD_SPACING = 12;
const TOTAL_PAGES = 1000;
const CENTER_INDEX = 500;

interface BudgetData {
    totalBudget: number;
    totalIncome: number;
    totalExpenses: number;
    leftToBudget: number;
    fixedExpenses: Array<{
        id: string;
        category: string;
        budget: number;
        spent: number;
        remaining: number;
    }>;
    flexibleExpenses: Array<{
        id: string;
        category: string;
        budget: number;
        spent: number;
        remaining: number;
    }>;
    currency: string;
}

interface BudgetMonthsProps {
    currentDate: Date;
    onMonthChange: (date: Date) => void;
    availableMonths?: Date[]; // Made optional since we generate our own 5-month range
    renderContent?: (month: Date) => React.ReactNode;
}

// Mock budget data generator
const generateBudgetData = (month: Date): BudgetData => {
    const monthIndex = month.getMonth();
    const baseMultiplier = 1 + (monthIndex % 3) * 0.3;

    return {
        totalBudget: Math.round(5000 * baseMultiplier),
        totalIncome: Math.round(6000 * baseMultiplier),
        totalExpenses: Math.round(4500 * baseMultiplier),
        leftToBudget: Math.round(500 * baseMultiplier),
        fixedExpenses: [
            {
                id: '1',
                category: 'Housing',
                budget: Math.round(1500 * baseMultiplier),
                spent: Math.round(1500 * baseMultiplier),
                remaining: 0,
            },
            {
                id: '2',
                category: 'Insurance',
                budget: Math.round(300 * baseMultiplier),
                spent: Math.round(300 * baseMultiplier),
                remaining: 0,
            },
            {
                id: '3',
                category: 'Utilities',
                budget: Math.round(200 * baseMultiplier),
                spent: Math.round(180 * baseMultiplier),
                remaining: Math.round(20 * baseMultiplier),
            },
        ],
        flexibleExpenses: [
            {
                id: '4',
                category: 'Groceries',
                budget: Math.round(600 * baseMultiplier),
                spent: Math.round(450 * baseMultiplier),
                remaining: Math.round(150 * baseMultiplier),
            },
            {
                id: '5',
                category: 'Entertainment',
                budget: Math.round(400 * baseMultiplier),
                spent: Math.round(320 * baseMultiplier),
                remaining: Math.round(80 * baseMultiplier),
            },
            {
                id: '6',
                category: 'Transportation',
                budget: Math.round(300 * baseMultiplier),
                spent: Math.round(280 * baseMultiplier),
                remaining: Math.round(20 * baseMultiplier),
            },
        ],
        currency: 'USD',
    };
};

export default function BudgetMonths({
    currentDate,
    onMonthChange,
    availableMonths: _availableMonths, // Renamed with underscore to indicate it's intentionally unused
    renderContent,
}: BudgetMonthsProps) {
    const pagerRef = useRef<PagerView>(null);
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

    // Month card component
    const MonthCard = useCallback(
        ({ month, index, isActive }: { month: Date; index: number; isActive: boolean }) => {
            const scale = useSharedValue(isActive ? 1.05 : 1);
            const opacity = useSharedValue(isActive ? 1 : 0.7);

            React.useEffect(() => {
                scale.value = withSpring(isActive ? 1.05 : 1, {
                    damping: 15,
                    stiffness: 150,
                });
                opacity.value = withSpring(isActive ? 1 : 0.7, {
                    damping: 15,
                    stiffness: 150,
                });
            }, [isActive, scale, opacity]);

            const animatedStyle = useAnimatedStyle(() => {
                return {
                    transform: [{ scale: scale.value }],
                    opacity: opacity.value,
                };
            });

            return (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => goToMonth(index)}
                    style={[styles.monthCard, isActive && tw`bg-purple-500 border-purple-500`]}
                >
                    <Animated.View style={animatedStyle}>
                        <Text
                            style={[
                                styles.monthText,
                                isActive ? styles.activeMonthText : styles.inactiveMonthText,
                            ]}
                        >
                            {format(month, 'MMM').toUpperCase()}
                        </Text>
                        <Text
                            style={[
                                styles.yearText,
                                isActive ? styles.activeYearText : styles.inactiveYearText,
                            ]}
                        >
                            {format(month, 'yyyy')}
                        </Text>
                    </Animated.View>
                </TouchableOpacity>
            );
        },
        [goToMonth],
    );

    // Page content renderer
    const renderPageContent = useCallback(
        (index: number) => {
            // Virtualization
            if (Math.abs(index - activeIndex) > 2) {
                return <View key={index} style={styles.pageContent} />;
            }

            const diff = index - CENTER_INDEX;
            const month = addMonths(initialDateRef.current, diff);
            const budgetData = generateBudgetData(month);

            if (renderContent) {
                return renderContent(month);
            }

            return (
                <ScrollView
                    style={styles.pageContent}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.pageContentContainer}
                >
                    <BudgetSummary budgetData={budgetData} />
                </ScrollView>
            );
        },
        [renderContent, BudgetSummary, activeIndex],
    );

    if (!isInitialized) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, satoshiFont.satoshiMedium]}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Month Navigation */}
            <View style={styles.monthNavigation}>
                <ScrollView
                    ref={monthScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.monthScrollContainer}
                    decelerationRate='fast'
                >
                    {displayedMonths.map((month, index) => (
                        <MonthCard
                            key={`${format(baseDate, 'yyyy-MM')}-${index}`}
                            month={month}
                            index={index}
                            isActive={index === 2}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Swipeable Content */}
            <PagerView
                ref={pagerRef}
                style={styles.pagerView}
                initialPage={CENTER_INDEX}
                onPageSelected={handlePageSelected}
                orientation='horizontal'
                offscreenPageLimit={1}
            >
                {Array.from({ length: TOTAL_PAGES }).map((_, index) => (
                    <View key={index} style={styles.page}>
                        {renderPageContent(index)}
                    </View>
                ))}
            </PagerView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#6B7280',
    },
    monthNavigation: {
        backgroundColor: '#ffffff',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    monthScrollContainer: {
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    monthCard: {
        width: MONTH_CARD_WIDTH,
        height: 56,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: MONTH_CARD_SPACING,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    activeMonthCard: {
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
    },
    monthText: {
        fontSize: 12,
        fontWeight: '700',
        ...satoshiFont.satoshiBold,
    },
    yearText: {
        fontSize: 10,
        marginTop: 2,
        ...satoshiFont.satoshiMedium,
    },
    activeMonthText: {
        color: '#ffffff',
    },
    inactiveMonthText: {
        color: '#6B7280',
    },
    activeYearText: {
        color: '#ffffff',
    },
    inactiveYearText: {
        color: '#9CA3AF',
    },
    pagerView: {
        flex: 1,
    },
    page: {
        flex: 1,
    },
    pageContent: {
        flex: 1,
    },
    pageContentContainer: {
        paddingBottom: 100,
    },
    summaryContainer: {
        padding: 20,
    },
    leftToBudgetCard: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    leftToBudgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    leftToBudgetLabel: {
        fontSize: 16,
        color: '#6B7280',
        ...satoshiFont.satoshiMedium,
    },
    infoIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoIconText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
    },
    leftToBudgetAmount: {
        fontSize: 32,
        fontWeight: '900',
        color: '#111827',
        ...satoshiFont.satoshiBlack,
    },
    summarySection: {
        marginBottom: 24,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        ...satoshiFont.satoshiBold,
    },
    moreOptions: {
        fontSize: 20,
        color: '#6B7280',
        fontWeight: '600',
    },
    summaryRow: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 8,
    },
    summaryRowLeft: {
        marginBottom: 8,
    },
    summaryRowRight: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
        ...satoshiFont.satoshiMedium,
    },
    summaryBudget: {
        fontSize: 14,
        color: '#6B7280',
        ...satoshiFont.satoshiRegular,
    },
    summaryEarned: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        ...satoshiFont.satoshiMedium,
    },
    summarySpent: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        ...satoshiFont.satoshiMedium,
    },
    summaryRemaining: {
        fontSize: 14,
        color: '#6B7280',
        ...satoshiFont.satoshiRegular,
    },
    expensesSection: {
        marginTop: 8,
    },
    expensesSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    expensesSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        ...satoshiFont.satoshiBold,
    },
    expensesSectionHeaderRight: {
        flexDirection: 'row',
    },
    expensesSectionLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 32,
        ...satoshiFont.satoshiMedium,
    },
    expenseCategoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    expenseCategoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    expenseCategoryIcon: {
        fontSize: 12,
        color: '#6B7280',
        marginRight: 12,
        transform: [{ rotate: '0deg' }],
    },
    expenseCategoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        ...satoshiFont.satoshiMedium,
    },
    expenseCategoryRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    expenseCategoryBudget: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        width: 80,
        textAlign: 'right',
        marginRight: 32,
        ...satoshiFont.satoshiMedium,
    },
    expenseCategoryRemaining: {
        fontSize: 16,
        color: '#6B7280',
        width: 80,
        textAlign: 'right',
        ...satoshiFont.satoshiRegular,
    },
    unbudgetedText: {
        paddingLeft: 28,
        marginTop: 8,
    },
    unbudgetedLabel: {
        fontSize: 14,
        color: '#6B7280',
        ...satoshiFont.satoshiRegular,
    },
});
