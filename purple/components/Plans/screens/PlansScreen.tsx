import { SafeAreaView, View } from '@/components/Shared/styled';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useMemo, useState } from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import PlansNavigationArea from '../molecules/NavigationArea/PlansNavigationArea';
import BudgetsContent from '../molecules/Budgets/BudgetsContent';

export default function PlansScreen() {
    const initialDate = useMemo(() => new Date(), []);
    const [selectedMonth, setSelectedMonth] = useState<Date>(initialDate);

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <ExpoStatusBar style='dark' />
            <View style={styles.parentView} className='bg-white space-y- flex-1 flex flex-col'>
                <PlansNavigationArea selectedMonth={selectedMonth} />
                <BudgetsContent currentDate={initialDate} onMonthChange={setSelectedMonth} />
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
