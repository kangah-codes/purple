import {
    LineChartSkeleton,
    PieChartSkeleton,
    SkeletonLine,
    SkeletonListItem,
} from '@/components/Shared/molecules/Skeleton';
import { ScrollView, View } from '@/components/Shared/styled';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import tw from 'twrnc';

export default function LoadingScreen() {
    return (
        <ScrollView style={[tw`bg-white h-full px-5`, styles.parentView]}>
            <ExpoStatusBar style='dark' />
            <View
                style={[styles.parentView, tw`bg-white flex flex-row justify-between items-center`]}
            >
                <View className='flex flex-col'>
                    <SkeletonLine width={80} height={20} />
                    <SkeletonLine width={60} height={20} />
                </View>
                <SkeletonLine width={40} height={20} />
            </View>
            <View className='mt-20'>
                <LineChartSkeleton />
            </View>
            <View style={[styles.parentView, tw`bg-white flex flex-col space-y-5`]}>
                <View className='my-5'>
                    <PieChartSkeleton />
                </View>

                <View className='my-5 bg-re'>
                    <View style={tw`flex-row justify-between items-center mb-2.5`}>
                        <SkeletonLine width={80} height={20} />
                        <SkeletonLine width={40} height={20} />
                    </View>
                    {[...Array(6)].map((_, index) => (
                        <React.Fragment key={index}>
                            <SkeletonListItem />
                            {index < 5 && (
                                <View style={tw`w-full h-1 border-gray-100 border-t mb-2.5`} />
                            )}
                        </React.Fragment>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
