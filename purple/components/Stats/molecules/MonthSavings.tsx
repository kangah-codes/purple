import { transactionData } from '@/components/Index/constants';
import CustomBottomSheetFlatList from '@/components/Shared/molecules/GlobalBottomSheetFlatList';
import { useBottomSheetFlatListStore } from '@/components/Shared/molecules/GlobalBottomSheetFlatList/hooks';
import { SafeAreaView, Text, View } from '@/components/Shared/styled';
import TransactionHistoryCard from '@/components/Transactions/molecules/TransactionHistoryCard';
import { Portal } from '@gorhom/portal';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React, { useCallback } from 'react';
import { FlatList, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import StatsHeader from '../molecules/StatsHeader';
import TransactionBreakdownCard from '../molecules/TransactionBreakdownCard';
import { keyExtractor } from '@/lib/utils/number';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';

export default function MonthSavings() {
    return (
        <View className='w-full space-y-2.5 border border-gray-200 rounded-xl p-5'>
            <Text style={GLOBAL_STYLESHEET.suprapower}>Savings this month</Text>

            <>
                <Text style={GLOBAL_STYLESHEET.suprapower} className='text-2xl text-purple-700'>
                    GHS 1,000.00
                </Text>
                <Text
                    style={GLOBAL_STYLESHEET.suprapower}
                    className='text-sm tracking-tighter text-gray-400'
                >
                    / GHS 2,000.00
                </Text>
            </>

            <View className='flex flex-row items-center space-x-0.5'>
                <View className='h-2 w-10 bg-purple-600 rounded-md' />
                <View className='h-2 flex-grow bg-purple-200 rounded-full' />
            </View>
        </View>
    );
}
