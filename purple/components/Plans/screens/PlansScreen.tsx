import { EditSquareIcon } from '@/components/SVG/24x24';
import {
    LinearGradient,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import { SceneMap, TabView } from 'react-native-tab-view';
import ExpensesScreen from './ExpensesScreen';
import SavingsScreen from './SavingsScreen';
import tw from 'twrnc';
const { width: screenWidth } = Dimensions.get('window');

export default function PlansScreen() {
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'expenses', title: 'Expenses' },
        { key: 'savings', title: 'Savings' },
    ]);
    const handleNavigation = () => {
        router.push('/plans/new-plan');
    };

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
                    className='w-full bg-purple-100 rounded-full py-2 flex flex-row mb-5 items-center'
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
                            // ...tw`mx-3`,
                            left: horizontalPadding,
                        }}
                    />
                    {routes.map((route, i) => {
                        return (
                            <View
                                style={{
                                    ...tw`flex-grow flex items-center justify-center rounded-full`,
                                }}
                                key={route.title}
                            >
                                <TouchableOpacity
                                    onPress={() => setIndex(i)}
                                    className='w-full flex items-center justify-center px-5 py-2.5 rounded-full'
                                >
                                    <Text
                                        style={GLOBAL_STYLESHEET.suprapower}
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
        <SafeAreaView className='bg-white relative h-full'>
            <ExpoStatusBar style='dark' />
            <View style={styles.parentView} className='bg-white space-y-5 flex-1 flex flex-col'>
                <View className='flex px-5 flex-row justify-between items-center pt-2.5'>
                    <View className='flex flex-col'>
                        <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg'>
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
            <LinearGradient
                className='rounded-full justify-center items-center space-y-4 absolute right-5 bottom-5'
                colors={['#c084fc', '#9333ea']}
            >
                <TouchableOpacity
                    className='items-center w-[55px] h-[55px] justify-center rounded-full p-3 '
                    onPress={handleNavigation}
                >
                    <EditSquareIcon stroke={'#fff'} />
                </TouchableOpacity>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
