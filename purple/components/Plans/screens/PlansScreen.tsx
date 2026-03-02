import { SafeAreaView, View } from '@/components/Shared/styled';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useMemo, useState, useCallback } from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import PlansNavigationArea from '../molecules/NavigationArea/PlansNavigationArea';
import BudgetsContent from '../molecules/Budgets/BudgetsContent';

const INITIAL_DATE = new Date();

export default function PlansScreen() {
    const initialDate = useMemo(() => INITIAL_DATE, []);
    const [selectedMonth, setSelectedMonth] = useState<Date>(initialDate);

    const handleMonthChange = useCallback((date: Date) => {
        setSelectedMonth(date);
    }, []);

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <ExpoStatusBar style='dark' />
            <View style={styles.parentView} className='bg-white space-y- flex-1 flex flex-col'>
                <PlansNavigationArea selectedMonth={selectedMonth} />
                <BudgetsContent currentDate={initialDate} onMonthChange={handleMonthChange} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeAreaView: {
        backgroundColor: '#fff',
        position: 'relative',
        height: '100%',
    },
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
