import { PlusIcon } from '@/components/SVG/24x24';
import {
    LinearGradient,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import { SceneMap, TabView } from 'react-native-tab-view';
import tw from 'twrnc';
import ExpensesScreen from './ExpensesScreen';
import SavingsScreen from './SavingsScreen';
import { useInfinitePlans } from '../hooks';
import { useRefreshOnFocus } from '@/lib/hooks/refetchOnFocus';

const { width: screenWidth } = Dimensions.get('window');
const linearGradientColours = ['#c084fc', '#9333ea'];
const routes = [
    { key: 'expenses', title: 'Budgets' },
    { key: 'savings', title: 'Savings' },
];

export default function PlansScreen() {
    const [index, setIndex] = useState(0);
    const handleNavigation = useCallback(() => router.push('/plans/new-plan'), []);
    const horizontalPadding = 10; // Add this line to define the horizontal padding
    const width = screenWidth - 40 - 2 * horizontalPadding; // Subtract the horizontal padding from both sides
    const translateXAnim = useRef(new Animated.Value(0)).current;
    const tabWidth = width / routes.length;

    useEffect(() => {
        Animated.spring(translateXAnim, {
            toValue: index * tabWidth,
            useNativeDriver: true,
        }).start();
    }, [index, tabWidth]);

    const renderTabBar = useCallback(() => {
        return (
            <View className='px-5'>
                <View
                    className='w-full bg-purple-50 rounded-full py-2 flex flex-row mb-5 items-center'
                    style={{
                        paddingHorizontal: horizontalPadding,
                    }}
                >
                    <Animated.View
                        style={{
                            position: 'absolute',
                            width: `${100 / routes.length}%`,
                            height: '100%',
                            backgroundColor: '#fff',
                            borderRadius: 999,
                            transform: [{ translateX: translateXAnim }],
                            left: horizontalPadding,
                        }}
                    />
                    {routes.map((route, i) => {
                        return (
                            <View
                                className='flex-grow flex items-center justify-center rounded-full'
                                key={route.title}
                            >
                                <TouchableOpacity
                                    onPress={() => setIndex(i)}
                                    className='w-full flex items-center justify-center px-5 py-2.5 rounded-full'
                                >
                                    <Text
                                        style={GLOBAL_STYLESHEET.satoshiBlack}
                                        className='text-base'
                                    >
                                        {route.title}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    }, [routes, index]);

    const renderScene = SceneMap({
        expenses: ExpensesScreen,
        savings: SavingsScreen,
    });

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <ExpoStatusBar style='dark' />
            <View style={styles.parentView} className='bg-white space-y-5 flex-1 flex flex-col'>
                <View className='flex px-5 flex-row justify-between items-center pt-2.5'>
                    <View className='flex flex-col'>
                        <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-lg'>
                            My Plans
                        </Text>
                    </View>
                </View>

                <TabView
                    navigationState={{
                        index,
                        routes,
                    }}
                    renderScene={renderScene}
                    renderTabBar={renderTabBar}
                    onIndexChange={setIndex}
                />
            </View>

            <LinearGradient colors={linearGradientColours} style={styles.linearGradient}>
                <TouchableOpacity onPress={handleNavigation} style={styles.touchableOpacity}>
                    <PlusIcon stroke={'#fff'} />
                </TouchableOpacity>
            </LinearGradient>
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
    linearGradient: {
        borderRadius: 999_999,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 20,
        bottom: 20,
    },
    touchableOpacity: {
        alignItems: 'center',
        width: 55,
        height: 55,
        justifyContent: 'center',
        borderRadius: 999_999,
        padding: 12,
    },
});
