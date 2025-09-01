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
                <View className='w-full flex flex-row justify-between items-center relative px-5 space-x-2.5'>
                    <View className='bg-purple-50 px-4 py-2 flex items-center justify-center rounded-full'>
                        <DotsHorizontalIcon
                            stroke='#9333EA'
                            strokeWidth={2.5}
                            width={24}
                            height={24}
                        />
                    </View>
                    <View className='absolute left-0 right-0 items-center'>
                        <Text style={satoshiFont.satoshiBlack} className='text-lg'>
                            Home
                        </Text>
                    </View>
                    <LinearGradient
                        className='rounded-full justify-center items-center'
                        colors={['#c084fc', '#9333ea']}
                    >
                        <TouchableOpacity
                            className='p-2 flex items-center justify-center rounded-full h-10 w-10'
                            onPress={() => router.push('/transactions/new-transaction')}
                        >
                            <GridIcon stroke={'#fff'} width={18} height={18} strokeWidth={2} />
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
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
