import { LinearGradient, SafeAreaView, Text, View } from '@/components/Shared/styled';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import tw from 'twrnc';
import SpendAreaChart from '../../Stats/molecules/SpendAreaChart';
import AccountCardCarousel from '../molecules/AccountCardCarousel';
import GettingStartedWidget from '../molecules/GettingStartedWidget';
import IndexNavigationArea from '../molecules/IndexNavigationArea';
import LoadingScreen from '../molecules/LoadingScreen';
import TransactionHistoryList from '../molecules/TransactionHistoryList';
import { useFontsLoaded } from '@/lib/hooks/useFontLoaded';

const now = new Date();

export default function IndexScreen() {
    const [sectionsLoaded, setSectionsLoaded] = useState({
        accounts: false,
        transactions: false,
    });
    const allLoaded = Object.values(sectionsLoaded).every(Boolean);
    const handleSectionLoaded = (section: string) =>
        setSectionsLoaded((prev) => ({ ...prev, [section]: true }));
    const scrollY = useSharedValue(0);
    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });
    const fontsLoaded = useFontsLoaded();

    const shadowStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(scrollY.value, [0, 10], [0, 1], Extrapolation.CLAMP),
        };
    });

    return (
        <SafeAreaView className='bg-white relative'>
            <ExpoStatusBar style='dark' />
            <View className='w-full relative flex' style={styles.parentView}>
                {!allLoaded && (
                    <View
                        pointerEvents='auto'
                        style={{ zIndex: 9999, elevation: 20 }}
                        className='w-screen h-full absolute'
                    >
                        <LoadingScreen />
                    </View>
                )}
                <IndexNavigationArea />
                <View className='flex flex-col mt-2.5 relative'>
                    <Animated.View
                        style={[
                            {
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: 0,
                                height: 10,
                                zIndex: 999,
                            },
                            shadowStyle,
                        ]}
                        pointerEvents='none'
                    >
                        <LinearGradient colors={['#faf5ff', 'transparent']} style={{ flex: 1 }} />
                    </Animated.View>

                    <Text>{fontsLoaded.toString()} FONTS</Text>

                    <Animated.ScrollView
                        contentContainerStyle={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                        style={[tw`h-full px-5 pt-2.5`]}
                    >
                        <AccountCardCarousel onLoaded={() => handleSectionLoaded('accounts')} />
                        <GettingStartedWidget />
                        <View className='mt-5'>
                            <SpendAreaChart startDate={now} />
                        </View>
                        <TransactionHistoryList
                            onLoaded={() => handleSectionLoaded('transactions')}
                        />
                    </Animated.ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    parentView: {
        paddingTop: (RNStatusBar.currentHeight ?? 0) + 10,
    },
    scrollView: {
        paddingBottom: 250,
    },
    shadow: {
        shadowColor: '#3c0366',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
});
