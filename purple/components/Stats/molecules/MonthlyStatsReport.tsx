import { LinearGradient, View } from '@/components/Shared/styled';
import { Transaction } from '@/components/Transactions/schema';
import React, { memo } from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import tw from 'twrnc';
import CashflowBarChart from '../molecules/CashflowBarChart';
import StatsHeatmap from '../molecules/Heatmap';
import ReportLoadingScreen from '../molecules/ReportLoadingScreen';
import SpendAreaChart from '../molecules/SpendAreaChart';
import SpendOverview from '../molecules/SpendOverview';
import SpendOverviewChart from '../molecules/SpendOverviewChart';
import SpendVsBudgetLineChart from './SpendVsBudgetLineChart';

interface MonthlyStatsPageProps {
    currentDate: Date;
    transactions: Transaction[];
    allHistoricalTransactions?: Transaction[];
    oldestTransactionDate?: Date;
    isLoading: boolean;
}

export default memo(function MonthlyStatsPage({
    transactions,
    allHistoricalTransactions,
    oldestTransactionDate,
    isLoading,
    currentDate,
}: MonthlyStatsPageProps) {
    const scrollY = useSharedValue(0);
    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const shadowStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(scrollY.value, [0, 10], [0, 1], Extrapolation.CLAMP),
        };
    });

    if (isLoading) return <ReportLoadingScreen showNavigation={false} />;

    return (
        <View className='flex relative'>
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        height: 10,
                        zIndex: 999,
                    },
                    shadowStyle,
                ]}
                pointerEvents='none'
            >
                <LinearGradient colors={['#faf5ff', 'transparent']} style={{ flex: 1 }} />
            </Animated.View>
            <Animated.ScrollView
                style={[tw`px-5 pt-2.5`]}
                contentContainerStyle={styles.scrollView}
                showsVerticalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
            >
                <SpendOverview transactions={transactions} />
                <CashflowBarChart
                    currentDate={currentDate}
                    allTransactions={allHistoricalTransactions || []}
                    oldestTransactionDate={oldestTransactionDate}
                />
                <SpendAreaChart startDate={currentDate} />
                <SpendVsBudgetLineChart startDate={currentDate} />
                <SpendOverviewChart transactions={transactions} startDate={currentDate} />
                <StatsHeatmap transactions={transactions} startDate={currentDate} />
            </Animated.ScrollView>
        </View>
    );
});

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
