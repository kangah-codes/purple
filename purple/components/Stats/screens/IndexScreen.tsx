import { SafeAreaView, ScrollView, Text, View } from '@/components/Shared/styled';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import StatsHeader from '../molecules/StatsHeader';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { getCurrentMonthYear } from '../utils';
import StatsNavigationArea from '../molecules/StatsNavigationArea';

const currentMonthYear = getCurrentMonthYear();

export default function StatsScreen() {
    return (
        <SafeAreaView className='relative h-full bg-white'>
            <ExpoStatusBar style='dark' />
            <ScrollView className='' style={styles.parentView}>
                {/* <View className='flex flex-row items-center justify-between py-2.5 px-5'>
                    <Text style={GLOBAL_STYLESHEET.satoshiBlack} className='text-lg'>
                        My Stats
                    </Text>
                    <View className='bg-purple-50 px-2 py-1 rounded-full'>
                        <Text
                            style={GLOBAL_STYLESHEET.satoshiBold}
                            className='text-xs text-purple-500'
                        >
                            {currentMonthYear}
                        </Text>
                    </View>
                </View> */}
                <StatsNavigationArea />

                <StatsHeader />

                {/* <FlatList
                    contentContainerStyle={styles.flatlist}
                    showsVerticalScrollIndicator={false}
                    data={[]}
                    renderItem={() => <></>}
                    ItemSeparatorComponent={itemSeparator}
                    keyExtractor={keyExtractor}
                    ListHeaderComponent={<StatsHeader />}
                    onRefresh={refetch}
                    refreshing={isFetching}
                /> */}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flatlist: {
        paddingBottom: 100,
    },
    flatlistContentContainer: {
        paddingBottom: 100,
        paddingHorizontal: 20,
        backgroundColor: 'white',
    },
    handleIndicator: {
        backgroundColor: '#D4D4D4',
    },
    container: {
        paddingHorizontal: 20,
    },
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
