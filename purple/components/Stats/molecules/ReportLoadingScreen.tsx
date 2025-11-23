import { SkeletonLine } from '@/components/Shared/molecules/Skeleton';
import { SafeAreaView, View } from '@/components/Shared/styled';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/SVG/icons/24x24';
import React from 'react';
import { StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import tw from 'twrnc';

export default function ReportLoadingScreen({
    showNavigation = true,
}: {
    showNavigation?: boolean;
}) {
    return (
        <SafeAreaView className='relative h-full flex flex-col'>
            {showNavigation && (
                <View
                    style={styles.parentView}
                    className='w-full flex flex-row my-2.5 justify-between items-center relative px-5'
                >
                    <View
                        className={`px-4 py-2 flex items-center justify-center rounded-full bg-gray-100`}
                    >
                        <ArrowLeftIcon stroke={'#9CA3AF'} strokeWidth={2.5} />
                    </View>

                    <View className='absolute left-0 right-0 items-center flex flex-col space-y-1'>
                        <SkeletonLine width={80} height={15} />
                        <SkeletonLine width={50} height={15} />
                    </View>

                    <View
                        className={`px-4 py-2 flex items-center justify-center rounded-full bg-gray-100`}
                    >
                        <ArrowRightIcon stroke={'#9CA3AF'} strokeWidth={2.5} />
                    </View>
                </View>
            )}
            <View style={[tw`px-5 flex flex-col space-y-5`]}>
                <View className='my-2.5 flex flex-col space-y-5'>
                    {[...Array(4)].map(() => (
                        <View
                            style={tw`p-5 space-y-2 border border-purple-100 rounded-3xl flex flex-col bg-purple-50/20`}
                        >
                            <View style={tw`flex-row justify-between items-center`}>
                                <SkeletonLine width={80} height={20} />
                                <SkeletonLine width={40} height={20} />
                            </View>
                            <View className='mt-2.5'>
                                <SkeletonLine width={168} height={20} />
                            </View>
                            <View className='mt-2.5'>
                                <SkeletonLine width={128} height={50} />
                            </View>
                            <View className='mt-2.5'>
                                <SkeletonLine width={300} height={70} />
                            </View>
                        </View>
                    ))}
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
