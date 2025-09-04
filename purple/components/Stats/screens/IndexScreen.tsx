import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { useTransactions } from '@/components/Transactions/hooks';
import { useRefreshOnFocus } from '@/lib/hooks/useRefreshOnFocus';
import { endOfMonth, startOfMonth } from 'date-fns';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import CashflowBarChart from '../molecules/CashflowBarChart';
import StatsHeatmap from '../molecules/Heatmap';
import SpendAreaChart from '../molecules/SpendAreaChart';
import SpendOverview from '../molecules/SpendOverview';
import SpendOverviewChart from '../molecules/SpendOverviewChart';
import SpendVsBudgetLineChart from '../molecules/SpendVsBudgetLineChart';
import StatsNavigationArea from '../molecules/StatsNavigationArea';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/SVG/icons/24x24';
import { satoshiFont } from '@/lib/constants/fonts';

const now = new Date();
const startDate = startOfMonth(now);
const endDate = endOfMonth(now);

export default function StatsScreen() {
    const { refetch, data } = useTransactions({
        requestQuery: {
            page_size: Infinity,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
        },
    });

    useRefreshOnFocus(refetch);

    return (
        <SafeAreaView className='relative h-full bg-white' style={styles.parentView}>
            <ExpoStatusBar style='dark' />
            <StatsNavigationArea />
            <View className='w-full flex flex-row mb-2.5 justify-between items-center relative px-5'>
                <TouchableOpacity className='bg-purple-50 px-4 py-2 flex items-center justify-center rounded-full'>
                    <ArrowLeftIcon stroke='#9333EA' strokeWidth={2.5} />
                </TouchableOpacity>

                <View className='absolute left-0 right-0 items-center'>
                    <Text style={satoshiFont.satoshiBold} className='text-sm'>
                        Sep 2025
                    </Text>
                </View>

                <TouchableOpacity className='bg-purple-50 px-4 py-2 flex items-center justify-center rounded-full'>
                    <ArrowRightIcon stroke='#9333EA' strokeWidth={2.5} />
                </TouchableOpacity>
            </View>
            <ScrollView className='px-5 pt-2.5' contentContainerStyle={styles.scrollView}>
                <SpendOverview transactions={data?.data ?? []} />
                <SpendOverviewChart transactions={data?.data ?? []} />
                <SpendVsBudgetLineChart />
                <SpendAreaChart />
                <CashflowBarChart />
                <StatsHeatmap transactions={data?.data ?? []} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        paddingBottom: 100,
    },
    flatlistContentContainer: {
        paddingBottom: 100,
        paddingHorizontal: 20,
        backgroundColor: 'white',
    },
    handleIndicator: {
        backgroundColor: '#D4D4D4',
    },
    container: {
        paddingHorizontal: 20,
    },
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
