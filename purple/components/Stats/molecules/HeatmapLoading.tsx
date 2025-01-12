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

type HeatmapLoadingProps = {
    blockSize: number;
};
export default function HeatmapLoading({ blockSize }: HeatmapLoadingProps) {
    return (
        <>
            <View style={[tw`bg-white flex flex-row justify-between items-center`]}>
                <View className='flex flex-col space-y-1'>
                    <View className='flex flex-row justify-between items-center w-full'>
                        <View
                            className='bg-white'
                            style={{
                                width: blockSize,
                                height: blockSize,
                            }}
                        />
                        <View
                            className='bg-white'
                            style={{
                                width: blockSize,
                                height: blockSize,
                            }}
                        />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                    </View>
                    <View className='flex flex-row justify-between items-center w-full'>
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                    </View>
                    <View className='flex flex-row justify-between items-center w-full'>
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                    </View>
                    <View className='flex flex-row justify-between items-center w-full'>
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                    </View>
                    <View className='flex flex-row justify-between items-center w-full'>
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <SkeletonLine width={blockSize} height={blockSize} />
                        <View
                            className='bg-white'
                            style={{
                                width: blockSize,
                                height: blockSize,
                            }}
                        />
                        <View
                            className='bg-white'
                            style={{
                                width: blockSize,
                                height: blockSize,
                            }}
                        />
                        <View
                            className='bg-white'
                            style={{
                                width: blockSize,
                                height: blockSize,
                            }}
                        />
                    </View>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
