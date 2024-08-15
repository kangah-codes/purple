import SavingPlanCard from '@/components/Plans/molecules/SavingPlanCard';
import {
    InputField,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from '@/components/Shared/styled';
import { ChevronRightIcon } from '@/components/SVG/16x16';
import useHasOnboarded from '@/lib/db/db';
import { router } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { FlatList, StatusBar as RNStatusBar, RefreshControl } from 'react-native';
import { SearchIcon } from '../../SVG/noscale';
import { savingData } from '../constants';
import AccountCardCarousel from '../molecules/AccountCardCarousel';
import TransactionHistoryList from '../molecules/TransactionHistoryList';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';

export default function IndexScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const { setHasOnboarded } = useHasOnboarded();

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);
    const renderItem = useCallback(
        ({ item, index }: { item: any; index: number }) => (
            <SavingPlanCard data={item} index={index} />
        ),
        [],
    );

    return (
        <SafeAreaView className='bg-white'>
            <ExpoStatusBar style='dark' />
            <View
                style={{
                    paddingTop: RNStatusBar.currentHeight,
                }}
                className='bg-white px-5'
            >
                <View className='flex flex-row justify-between items-center pt-2.5'>
                    <View className='flex flex-col'>
                        <Text style={GLOBAL_STYLESHEET.suprapower} className='text-lg'>
                            Hi, Joshua 👋
                        </Text>
                    </View>
                </View>

                <View className='mt-5'>
                    <View className='relative flex justify-center'>
                        <InputField
                            className='bg-purple-50/80 rounded-full px-4 pl-10 text-xs border border-purple-200 h-12 text-gray-900'
                            style={GLOBAL_STYLESHEET.interSemiBold}
                            placeholder='Search'
                            cursorColor={'#000'}
                        />
                        <SearchIcon
                            width={16}
                            height={16}
                            style={{ position: 'absolute', left: 15 }}
                            stroke='#A855F7'
                        />
                    </View>
                </View>

                <ScrollView
                    className='mt-5 h-full space-y-5'
                    contentContainerStyle={{
                        paddingBottom: 100,
                    }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    <View className='w-full'>
                        <AccountCardCarousel />
                    </View>

                    <View className='flex flex-col space-y-5'>
                        <View className='flex flex-row w-full justify-between items-center'>
                            <Text
                                style={GLOBAL_STYLESHEET.suprapower}
                                className='text-base text-black'
                            >
                                My saving plans
                            </Text>

                            <TouchableOpacity
                                className='flex flex-row items-center space-x-1'
                                onPress={() => router.push('/plans')}
                            >
                                <Text
                                    style={GLOBAL_STYLESHEET.interSemiBold}
                                    className='text-sm tracking-tighter text-purple-700'
                                >
                                    View All
                                </Text>
                                <ChevronRightIcon stroke='#9333ea' />
                            </TouchableOpacity>
                        </View>

                        {/* <View className="w-full px-5 flex flex-col items-center justify-center mb-5">
							<View className="my-5 w-full">
								<Image
									source={require("@/assets/images/graphics/4.png")}
									className="w-full h-72"
								/>
							</View>

							<Text
								style={{ fontFamily: "Suprapower" }}
								className="text-base text-black"
							>
								No plans yet
							</Text>
						</View> */}
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={savingData}
                            renderItem={renderItem}
                            keyExtractor={(_, index) => index.toString()}
                        />
                    </View>

                    <TransactionHistoryList />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
