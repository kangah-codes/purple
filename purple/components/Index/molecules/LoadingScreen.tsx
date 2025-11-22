import React from 'react';
import AnimatedSkeleton from '@/components/Shared/atoms/Skeleton';
import {
    LinearGradient,
    SafeAreaView,
    Text,
    View,
    TouchableOpacity,
} from '@/components/Shared/styled';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import tw from 'twrnc';
import { SettingsCogIcon, BellIcon } from '@/components/SVG/icons/24x24';
import { DotsHorizontalIcon } from '@/components/SVG/icons/noscale';
import { satoshiFont } from '@/lib/constants/fonts';
import { router } from 'expo-router';

const SkeletonLine = ({ width, height = 5 }: { width: number | string; height?: number }) => (
    <AnimatedSkeleton style={[tw`rounded-3xl mb-2.5`, { width, height }]} />
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
                <View className='w-full flex flex-row justify-between items-center relative'>
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

                    <View className='flex flex-row space-x-2.5 items-center'>
                        <TouchableOpacity
                            onPress={() => router.push('/settings')}
                            className='bg-purple-50 p-2 flex items-center justify-center rounded-full'
                        >
                            <SettingsCogIcon
                                stroke='#c27aff'
                                strokeWidth={2}
                                width={24}
                                height={24}
                            />
                        </TouchableOpacity>
                        <LinearGradient
                            className='rounded-full relative'
                            colors={['#c084fc', '#9333ea']}
                        >
                            <TouchableOpacity
                                className='flex items-center justify-center rounded-full w-9 h-9'
                                onPress={() => router.push('/notifications')}
                            >
                                <BellIcon stroke={'#fff'} width={20} height={20} strokeWidth={2} />
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </View>
                <View
                    style={tw`flex-col justify-between bg-white p-5 mt-5 rounded-3xl border border-purple-100`}
                >
                    <SkeletonLine width={80} height={20} />
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

                    <View style={tw`p-5 space-y-2 border border-purple-100 rounded-3xl bg-white`}>
                        <View style={tw`flex-row justify-between items-center`}>
                            <SkeletonLine width={80} height={20} />
                            <SkeletonLine width={40} height={20} />
                        </View>
                        <SkeletonLine width={168} height={20} />
                        <SkeletonLine width={80} height={20} />
                        <SkeletonLine width='100%' height={40} />
                    </View>
                </View>
                <View className='my-5 bg-white p-5 rounded-3xl border border-purple-100'>
                    <View style={tw`flex-row justify-between items-center mb-2.5`}>
                        <SkeletonLine width={80} height={20} />
                        <SkeletonLine width={40} height={20} />
                    </View>
                    {[...Array(6)].map((_, index) => (
                        <React.Fragment key={index}>
                            <SkeletonListItem />
                            {index < 5 && (
                                <View style={tw`w-full h-1 border-purple-100 border-t mb-2.5`} />
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
