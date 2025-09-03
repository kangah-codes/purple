import AnimatedClouds from '@/components/Shared/molecules/AnimatedClouds';
import {
    LinearGradient,
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
} from '@/components/Shared/styled';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import AccountCardCarousel from '../molecules/AccountCardCarousel';
import LoadingScreen from '../molecules/LoadingScreen';
import PlanHistoryList from '../molecules/PlanHistoryList';
import TransactionHistoryList from '../molecules/TransactionHistoryList';
import DropdownMenu from '@/components/Shared/molecules/DropdownMenu';
import { MenuOption } from '@/components/Shared/molecules/DropdownMenu/MenuOption';
import { CalendarIcon } from '@/components/SVG/icons/16x16';
import {
    TrashIcon,
    PlusIcon,
    SettingsCogIcon,
    BellIcon,
    GridIcon,
} from '@/components/SVG/icons/24x24';
import { DotsHorizontalIcon } from '@/components/SVG/icons/noscale';
import { satoshiFont } from '@/lib/constants/fonts';
import { router } from 'expo-router';
import IndexNavigationArea from '../molecules/IndexNavigationArea';
import GettingStartedWidget from '../molecules/GettingStartedWidget';
import SpendAreaChart from '../molecules/SpendAreaChart';

const linearGradientColours = ['#e9d4ff', '#fff'];

export default function IndexScreen() {
    const [sectionsLoaded, setSectionsLoaded] = useState({
        accounts: false,
        // plans: false,
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
                    className='flex px-5 py-2.5 h-[450] absolute w-full'
                    colors={linearGradientColours}
                />
                <AnimatedClouds baseSpeed={0.1} minHeight={10} maxHeight={450} spawnRate={1} />
                <IndexNavigationArea />
                <View className='flex flex-col'>
                    <ScrollView
                        className='mt-5 h-full px-5'
                        contentContainerStyle={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                    >
                        <AccountCardCarousel onLoaded={() => handleSectionLoaded('accounts')} />
                        <GettingStartedWidget />
                        <SpendAreaChart />
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
        paddingBottom: 250,
    },
    shadow: {
        shadowColor: '#3c0366',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
});
