import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, LayoutChangeEvent, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { endOfMonth, formatISO, startOfMonth } from 'date-fns';
import { View } from '@/components/Shared/styled';
import { useTransactions } from '@/components/Transactions/hooks';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import {
    IndexStatsCardId,
    IndexStatsCardDefinition,
    DEFAULT_INDEX_STATS_CARD_ORDER,
    INDEX_STATS_CARDS,
} from './IndexStatsCards';

type StatsCardsCarouselProps = {
    startDate: Date;
};

const HEIGHT_SPRING_CONFIG = { damping: 15, stiffness: 180 };

export default function StatsCardsCarousel({ startDate }: StatsCardsCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [slideHeights, setSlideHeights] = useState<Partial<Record<IndexStatsCardId, number>>>({});
    const viewportHeight = useSharedValue<number>(0);
    const { data: transactionsData } = useTransactions({
        requestQuery: {
            start_date: formatISO(startOfMonth(startDate)),
            end_date: formatISO(endOfMonth(startDate)),
            page_size: Infinity,
        },
    });

    const transactions = useMemo(() => transactionsData?.data ?? [], [transactionsData?.data]);

    // TODO: when order functionality is implemented replace DEFAULT_INDEX_STATS_CARD_ORDER with user settings
    const cards: IndexStatsCardDefinition[] = DEFAULT_INDEX_STATS_CARD_ORDER.map(
        (id) => INDEX_STATS_CARDS[id],
    );

    const renderItem = useCallback(
        ({ item, index }: { item: IndexStatsCardDefinition; index: number }) => {
            const onLayout = (e: LayoutChangeEvent) => {
                const height = e.nativeEvent.layout.height;
                if (!height) return;

                setSlideHeights((prev) => {
                    if (prev[item.id] === height) return prev;
                    return { ...prev, [item.id]: height };
                });

                if (index === activeIndex) {
                    if (viewportHeight.value === 0) {
                        viewportHeight.value = height;
                    } else if (viewportHeight.value !== height) {
                        viewportHeight.value = withSpring(height, HEIGHT_SPRING_CONFIG);
                    }
                }
            };

            return (
                <View className='w-full' onLayout={onLayout}>
                    {item.render({ startDate, transactions })}
                </View>
            );
        },
        [activeIndex, startDate, transactions, viewportHeight],
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

            const nextCardId = cards[index]?.id;
            if (!nextCardId) return;

            const nextHeight = slideHeights[nextCardId];
            if (typeof nextHeight === 'number' && nextHeight > 0) {
                viewportHeight.value = withSpring(nextHeight, HEIGHT_SPRING_CONFIG);
            } else {
                // if we havent measured this slide yet unlock height (auto) so content can render,
                // then the onLayout handler will spring to the measured height
                viewportHeight.value = 0;
            }
        },
        [cards, slideHeights, viewportHeight],
    );

    return (
        <View className='bg-purple-50 border border-purple-100 rounded-3xl mt-5 flex items-center'>
            <Animated.View style={[styles.viewport, animatedViewportStyle]}>
                <Carousel
                    data={cards as unknown as any[]}
                    renderItem={renderItem as unknown as any}
                    sliderWidth={styles.slider.width}
                    itemWidth={styles.item.width}
                    layout={'default'}
                    autoplay={false}
                    style={styles.carouselStyle as StyleProp<ViewStyle>}
                    onSnapToItem={handleSnapToItem}
                    loop
                />
            </Animated.View>
            <Pagination
                dotsLength={cards.length}
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
    // IndexScreen applies horizontal padding (px-5 => 20) and this card also has p-5 (20)
    // so the usable content width matches the account carousel sizing screenWidth - 80
    slider: { width: Dimensions.get('window').width - 80 },
    item: { width: Dimensions.get('window').width - 80 },
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
        paddingVertical: 20,
        paddingHorizontal: 0,
    },
});
