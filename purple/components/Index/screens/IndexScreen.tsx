import AnimatedClouds from '@/components/Shared/molecules/AnimatedClouds';
import { LinearGradient, SafeAreaView, ScrollView, View } from '@/components/Shared/styled';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import AccountCardCarousel from '../molecules/AccountCardCarousel';
import LoadingScreen from '../molecules/LoadingScreen';
import PlanHistoryList from '../molecules/PlanHistoryList';
import TransactionHistoryList from '../molecules/TransactionHistoryList';

const linearGradientColours = ['#D8B4FE', '#fff'];

export default function IndexScreen() {
    const [sectionsLoaded, setSectionsLoaded] = useState({
        accounts: false,
        plans: false,
        transactions: false,
    });
    const allLoaded = Object.values(sectionsLoaded).every(Boolean);
    const handleSectionLoaded = (section: string) =>
        setSectionsLoaded((prev) => ({ ...prev, [section]: true }));

    return (
        <SafeAreaView className='bg-white relative'>
            <ExpoStatusBar style='dark' />
            <View className='w-full relative flex' style={styles.parentView}>
                {!allLoaded && (
                    <View
                        pointerEvents='auto'
                        style={[
                            {
                                zIndex: 9999,
                                elevation: 20,
                            },
                        ]}
                        className='w-screen h-full absolute'
                    >
                        <LoadingScreen />
                    </View>
                )}
                <LinearGradient
                    className='flex px-5 py-2.5 h-[350] absolute w-full'
                    colors={linearGradientColours}
                />
                <AnimatedClouds baseSpeed={0.1} minHeight={10} maxHeight={450} spawnRate={1} />
                <View className='flex flex-col'>
                    <ScrollView
                        className='mt-5 h-full'
                        contentContainerStyle={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                    >
                        <AccountCardCarousel onLoaded={() => handleSectionLoaded('accounts')} />
                        <PlanHistoryList onLoaded={() => handleSectionLoaded('plans')} />
                        <TransactionHistoryList
                            onLoaded={() => handleSectionLoaded('transactions')}
                        />
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    searchIcon: {
        position: 'absolute',
        left: 15,
    },
    parentView: {
        paddingTop: (RNStatusBar.currentHeight ?? 0) + 10, // TODO: idk why this worked
    },
    scrollView: {
        paddingBottom: 100,
    },
});
