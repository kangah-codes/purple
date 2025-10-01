import { SafeAreaView, Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import { SceneMap, TabView } from 'react-native-tab-view';
import ExpensesScreen from './ExpensesScreen';
import SavingsScreen from './SavingsScreen';
import PlansNavigationArea from '../molecules/PlansNavigationArea';
import { AnimatedPillSelect } from '@/components/Shared/molecules/AnimatedPillSelect';
import tw from 'twrnc';

const { width: screenWidth } = Dimensions.get('window');
const routes = [
    { key: 'expenses', title: 'Budgets' },
    { key: 'savings', title: 'Savings' },
];

export default function PlansScreen() {
    const [index, setIndex] = useState(0);
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
                    className='bg-[] rounded-full px-1'
                    style={{ backgroundColor: 'rgba(243, 232, 255, 0.5)' }}
                >
                    <AnimatedPillSelect
                        options={routes.map((p) => ({ label: p.title, value: p.key }))}
                        selected={routes[index].key}
                        onChange={(key) => {
                            const idx = routes.findIndex((r) => r.key === key);
                            if (idx !== -1) setIndex(idx);
                        }}
                        styling={{
                            pill: { backgroundColor: 'white' },
                            background: {},
                            option: { ...tw`p-3` },
                        }}
                        renderItem={(opt, isSelected) => (
                            <Text
                                style={[
                                    satoshiFont.satoshiBold,
                                    isSelected ? styles.activeText : styles.inactiveText,
                                ]}
                                className='text-sm py-2'
                            >
                                {opt.label}
                            </Text>
                        )}
                    />
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
            <View style={styles.parentView} className='bg-white space-y- flex-1 flex flex-col'>
                <PlansNavigationArea />

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
    pill: {
        backgroundColor: 'transparent',
    },
    activePill: {
        backgroundColor: 'rgba(243, 232, 255, 0.7)',
    },
    activeText: {
        color: '#8200db',
        fontFamily: satoshiFont.satoshiBlack.fontFamily,
    },
    inactiveText: {
        color: '#c27aff',
    },
});
