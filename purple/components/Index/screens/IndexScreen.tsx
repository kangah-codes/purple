import { InputField, SafeAreaView, ScrollView, Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { StatusBar as RNStatusBar, RefreshControl, StyleSheet } from 'react-native';
import { SearchIcon } from '../../SVG/noscale';
import AccountCardCarousel from '../molecules/AccountCardCarousel';
import PlanHistoryList from '../molecules/PlanHistoryList';
import TransactionHistoryList from '../molecules/TransactionHistoryList';

export default function IndexScreen() {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    return (
        <SafeAreaView className='bg-white'>
            <ExpoStatusBar style='dark' />
            <View style={styles.parentView} className='bg-white px-5'>
                <View className='flex flex-row justify-between items-center pt-2.5'>
                    <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg'>
                        Hi, Joshua 👋
                    </Text>
                </View>

                <View className='relative flex justify-center mt-5'>
                    <InputField
                        className='bg-purple-50/80 rounded-full px-4 pl-10 text-xs border border-purple-200 h-12 text-gray-900'
                        style={GLOBAL_STYLESHEET.interSemiBold}
                        placeholder='Search'
                        cursorColor={'#000'}
                    />
                    <SearchIcon width={16} height={16} style={styles.searchIcon} stroke='#A855F7' />
                </View>

                <ScrollView
                    className='mt-5 h-full space-y-5'
                    contentContainerStyle={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    <AccountCardCarousel />
                    <PlanHistoryList />
                    <TransactionHistoryList />
                </ScrollView>
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
        paddingTop: RNStatusBar.currentHeight,
    },
    scrollView: {
        paddingBottom: 100,
    },
});
