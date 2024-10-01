import React from 'react';
import AnimatedSkeleton from '@/components/Shared/atoms/Skeleton';
import { SafeAreaView, View } from '@/components/Shared/styled';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import tw from 'twrnc';

const SkeletonLine = ({ width, height = 5 }: { width: number | string; height?: number }) => (
    <AnimatedSkeleton style={[tw`rounded-md mb-2.5`, { width, height }]} />
);

const SkeletonCircle = ({ size = 40 }) => (
    <AnimatedSkeleton style={[tw`rounded-full`, { width: size, height: size }]} />
);

const SkeletonListItem = () => (
    <View style={tw`flex-row justify-between items-center mb-2.5`}>
        <View style={tw`flex-row items-center`}>
            <SkeletonCircle size={40} />
            <View className='ml-2.5'>
                <SkeletonLine width={80} height={16} />
                <SkeletonLine width={40} height={16} />
            </View>
        </View>
        <SkeletonLine width={80} height={20} />
    </View>
);

export default function LoadingScreen() {
    return (
        <SafeAreaView style={tw`bg-white h-full`}>
            <ExpoStatusBar style='dark' />
            <View style={[styles.parentView, tw`bg-white px-5 flex flex-col space-y-5`]}>
                <View style={tw`flex-row justify-between items-center pt-2.5`}>
                    <SkeletonLine width={80} height={20} />
                </View>

                <View>
                    <SkeletonLine width={128} height={20} />
                    <SkeletonLine width={288} height={20} />
                    <SkeletonLine width={168} height={20} />
                    <SkeletonLine width={80} height={20} />
                </View>

                <View className='my-5'>
                    <View style={tw`flex-row justify-between items-center mb-2.5`}>
                        <SkeletonLine width={80} height={20} />
                        <SkeletonLine width={40} height={20} />
                    </View>

                    <View style={tw`p-5 space-y-2 border border-gray-100 rounded-xl`}>
                        <View style={tw`flex-row justify-between items-center`}>
                            <SkeletonLine width={80} height={20} />
                            <SkeletonLine width={40} height={20} />
                        </View>
                        <SkeletonLine width={168} height={20} />
                        <SkeletonLine width={80} height={20} />
                        <SkeletonLine width='100%' height={40} />
                    </View>
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    parentView: {
        paddingTop: RNStatusBar.currentHeight,
    },
});
