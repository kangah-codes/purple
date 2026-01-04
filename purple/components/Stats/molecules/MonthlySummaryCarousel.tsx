import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, LayoutChangeEvent, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { View } from '@/components/Shared/styled';
import { Transaction } from '@/components/Transactions/schema';

import SpendOverview from './SpendOverview';
import CashflowCard from './CashflowCard';

type MonthlySummaryCarouselProps = {
    currentDate: Date;
    transactions: Transaction[];
    allHistoricalTransactions: Transaction[];
    oldestTransactionDate?: Date;
};

type SlideId = 'spend_overview' | 'cashflow_card';

const HEIGHT_SPRING_CONFIG = { damping: 15, stiffness: 180 };

export default function MonthlySummaryCarousel({
    currentDate,
    transactions,
    allHistoricalTransactions,
    oldestTransactionDate,
}: MonthlySummaryCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [slideHeights, setSlideHeights] = useState<Partial<Record<SlideId, number>>>({});
    const viewportHeight = useSharedValue<number>(0);

    const slides = useMemo(() => ['spend_overview', 'cashflow_card'] as const, []);

    const renderItem = useCallback(
        ({ item, index }: { item: (typeof slides)[number]; index: number }) => {
            const onLayout = (e: LayoutChangeEvent) => {
                const height = e.nativeEvent.layout.height;
                if (!height) return;

                setSlideHeights((prev) => {
                    if (prev[item] === height) return prev;
                    return { ...prev, [item]: height };
                });

                if (index === activeIndex) {
                    if (viewportHeight.value === 0) {
                        viewportHeight.value = height;
                    } else if (viewportHeight.value !== height) {
                        viewportHeight.value = withSpring(height, HEIGHT_SPRING_CONFIG);
                    }
                }
            };

            if (item === 'cashflow_card') {
                return (
                    <View onLayout={onLayout}>
                        <CashflowCard
                            currentDate={currentDate}
                            allTransactions={allHistoricalTransactions}
                            oldestTransactionDate={oldestTransactionDate}
                        />
                    </View>
                );
            }

            return (
                <View onLayout={onLayout}>
                    <SpendOverview transactions={transactions} />
                </View>
            );
        },
        [
            activeIndex,
            allHistoricalTransactions,
            currentDate,
            oldestTransactionDate,
            transactions,
            viewportHeight,
        ],
    );

    const animatedViewportStyle = useAnimatedStyle(() => {
        const height = viewportHeight.value;
        return {
            height: height > 0 ? height : undefined,
        };
    }, []);

    const handleSnapToItem = useCallback(
        (index: number) => {
            setActiveIndex(index);

            const nextSlideId = slides[index];
            const nextHeight = slideHeights[nextSlideId];

            if (typeof nextHeight === 'number' && nextHeight > 0) {
                viewportHeight.value = withSpring(nextHeight, HEIGHT_SPRING_CONFIG);
            } else {
                // Unlock height (auto) until measured, to avoid clipping.
                viewportHeight.value = 0;
            }
        },
        [slideHeights, slides, viewportHeight],
    );

    return (
        <View className='bg-purple-50 p-5 border border-purple-100 rounded-3xl'>
            <Animated.View style={[styles.viewport, animatedViewportStyle]}>
                <Carousel
                    data={slides as unknown as any[]}
                    renderItem={renderItem as unknown as any}
                    sliderWidth={styles.slider.width}
                    itemWidth={styles.item.width}
                    layout={'default'}
                    autoplay={false}
                    style={styles.carouselStyle as StyleProp<ViewStyle>}
                    onSnapToItem={handleSnapToItem}
                    loop={false}
                />
            </Animated.View>
            <Pagination
                dotsLength={slides.length}
                activeDotIndex={activeIndex}
                dotStyle={styles.paginationDotStyle}
                inactiveDotOpacity={0.4}
                inactiveDotScale={0.6}
                containerStyle={styles.containerStyle}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    // MonthlyStatsReport scroll view applies horizontal padding (px-5 => 20).
    slider: { width: Dimensions.get('window').width - 40 },
    item: { width: Dimensions.get('window').width - 40 },
    carouselStyle: {
        width: '100%',
    },
    viewport: {
        overflow: 'hidden',
    },
    paginationDotStyle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#9333EA',
        marginHorizontal: -10,
    },
    containerStyle: {
        paddingTop: 12,
        paddingBottom: 0,
        paddingHorizontal: 0,
    },
});
