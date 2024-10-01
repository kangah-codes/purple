import { InputField, SafeAreaView, ScrollView, Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { StatusBar as RNStatusBar, RefreshControl, StyleSheet } from 'react-native';
import { SearchIcon } from '../../SVG/noscale';
import AccountCardCarousel from '../molecules/AccountCardCarousel';
import PlanHistoryList from '../molecules/PlanHistoryList';
import TransactionHistoryList from '../molecules/TransactionHistoryList';
import { SessionData } from '@/components/Auth/schema';
import { useUser } from '@/components/Profile/hooks';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/components/Auth/hooks';
import AnimatedSkeleton from '@/components/Shared/atoms/Skeleton';
import tw from 'twrnc';

export default function LoadingScreen() {
    return (
        <SafeAreaView className='bg-white h-full'>
            <ExpoStatusBar style='dark' />
            <View style={styles.parentView} className='bg-white px-5 flex flex-col space-y-5'>
                <View className='flex flex-row justify-between items-center pt-2.5'>
                    <AnimatedSkeleton style={{ ...tw`w-20 h-5 rounded-md` }} />
                </View>

                <View className='flex flex-col space-y-2.5 w-full'>
                    <AnimatedSkeleton style={{ ...tw`w-32 h-5 rounded-md` }} />
                    <AnimatedSkeleton style={{ ...tw`w-72 h-5 rounded-md` }} />
                    <AnimatedSkeleton style={{ ...tw`w-42 h-5 rounded-md` }} />
                    <AnimatedSkeleton style={{ ...tw`w-20 h-5 rounded-md` }} />
                    {/* <AnimatedSkeleton style={{ ...tw`w-full h-10 rounded-md` }} /> */}
                </View>

                <View className='flex flex-col space-y-2.5 w-full'>
                    <View className='flex flex-row justify-between items-center'>
                        <AnimatedSkeleton style={{ ...tw`w-20 h-5 rounded-md` }} />
                        <AnimatedSkeleton style={{ ...tw`w-10 h-5 rounded-md` }} />
                    </View>

                    <View className='flex flex-col p-5 space-y-2 border border-gray-200 rounded-xl'>
                        <View className='flex flex-row justify-between items-center'>
                            <AnimatedSkeleton style={{ ...tw`w-20 h-5 rounded-md` }} />
                            <AnimatedSkeleton style={{ ...tw`w-10 h-5 rounded-md` }} />
                        </View>
                        <AnimatedSkeleton style={{ ...tw`w-42 h-5 rounded-md` }} />
                        <AnimatedSkeleton style={{ ...tw`w-20 h-5 rounded-md` }} />
                        <AnimatedSkeleton style={{ ...tw`w-full h-10 rounded-md` }} />
                    </View>
                </View>

                <View className='flex flex-col space-y-2.5 w-full'>
                    <View className='flex flex-row justify-between items-center'>
                        <AnimatedSkeleton style={{ ...tw`w-20 h-5 rounded-md` }} />
                        <AnimatedSkeleton style={{ ...tw`w-10 h-5 rounded-md` }} />
                    </View>

                    <View className='flex flex-row justify-between items-center'>
                        <View className='flex flex-row space-x-2 items-center'>
                            <AnimatedSkeleton style={{ ...tw`w-10 h-10 rounded-full` }} />
                            <View className='flex flex-col space-y-1'>
                                <AnimatedSkeleton style={{ ...tw`w-20 h-4 rounded-md` }} />
                                <AnimatedSkeleton style={{ ...tw`w-10 h-4 rounded-md` }} />
                            </View>
                        </View>
                        <AnimatedSkeleton style={{ ...tw`w-20 h-5 rounded-md` }} />
                    </View>
                    <View className='flex flex-row justify-between items-center'>
                        <View className='flex flex-row space-x-2 items-center'>
                            <AnimatedSkeleton style={{ ...tw`w-10 h-10 rounded-full` }} />
                            <View className='flex flex-col space-y-1'>
                                <AnimatedSkeleton style={{ ...tw`w-20 h-4 rounded-md` }} />
                                <AnimatedSkeleton style={{ ...tw`w-10 h-4 rounded-md` }} />
                            </View>
                        </View>
                        <AnimatedSkeleton style={{ ...tw`w-22 h-5 rounded-md` }} />
                    </View>
                    <View className='flex flex-row justify-between items-center'>
                        <View className='flex flex-row space-x-2 items-center'>
                            <AnimatedSkeleton style={{ ...tw`w-10 h-10 rounded-full` }} />
                            <View className='flex flex-col space-y-1'>
                                <AnimatedSkeleton style={{ ...tw`w-20 h-4 rounded-md` }} />
                                <AnimatedSkeleton style={{ ...tw`w-10 h-4 rounded-md` }} />
                            </View>
                        </View>
                        <AnimatedSkeleton style={{ ...tw`w-10 h-5 rounded-md` }} />
                    </View>
                    <View className='flex flex-row justify-between items-center'>
                        <View className='flex flex-row space-x-2 items-center'>
                            <AnimatedSkeleton style={{ ...tw`w-10 h-10 rounded-full` }} />
                            <View className='flex flex-col space-y-1'>
                                <AnimatedSkeleton style={{ ...tw`w-20 h-4 rounded-md` }} />
                                <AnimatedSkeleton style={{ ...tw`w-10 h-4 rounded-md` }} />
                            </View>
                        </View>
                        <AnimatedSkeleton style={{ ...tw`w-18 h-5 rounded-md` }} />
                    </View>
                    <View className='flex flex-row justify-between items-center'>
                        <View className='flex flex-row space-x-2 items-center'>
                            <AnimatedSkeleton style={{ ...tw`w-10 h-10 rounded-full` }} />
                            <View className='flex flex-col space-y-1'>
                                <AnimatedSkeleton style={{ ...tw`w-20 h-4 rounded-md` }} />
                                <AnimatedSkeleton style={{ ...tw`w-10 h-4 rounded-md` }} />
                            </View>
                        </View>
                        <AnimatedSkeleton style={{ ...tw`w-30 h-5 rounded-md` }} />
                    </View>
                    <View className='flex flex-row justify-between items-center'>
                        <View className='flex flex-row space-x-2 items-center'>
                            <AnimatedSkeleton style={{ ...tw`w-10 h-10 rounded-full` }} />
                            <View className='flex flex-col space-y-1'>
                                <AnimatedSkeleton style={{ ...tw`w-20 h-4 rounded-md` }} />
                                <AnimatedSkeleton style={{ ...tw`w-10 h-4 rounded-md` }} />
                            </View>
                        </View>
                        <AnimatedSkeleton style={{ ...tw`w-20 h-5 rounded-md` }} />
                    </View>
                </View>
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
