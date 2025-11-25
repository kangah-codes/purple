import { SafeAreaView, View } from '@/components/Shared/styled';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import PlansNavigationArea from '../molecules/NavigationArea/PlansNavigationArea';
import BudgetsContent from '../molecules/Budgets/BudgetsContent';

export default function PlansScreen() {
    return (
        <SafeAreaView style={styles.safeAreaView}>
            <ExpoStatusBar style='dark' />
            <View style={styles.parentView} className='bg-white space-y- flex-1 flex flex-col'>
                <PlansNavigationArea />
                <BudgetsContent
                    currentDate={new Date()}
                    onMonthChange={(date) => {
                        console.log('Selected month:', date);
                    }}
                />
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
