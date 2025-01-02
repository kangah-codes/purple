import { usePlanStore } from '@/components/Plans/hooks';
import PlanCard from '@/components/Plans/molecules/PlanCard';
import { Plan } from '@/components/Plans/schema';
import { ChevronRightIcon } from '@/components/SVG/16x16';
import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { keyExtractor } from '@/lib/utils/number';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React from 'react';
import { useCallback } from 'react';
import { Dimensions, FlatList } from 'react-native';

const width = Dimensions.get('screen').width;

export default function PlanHistoryList() {
    const { plans } = usePlanStore();
    const renderItem = useCallback(
        ({ item, index }: { item: Plan; index: number }) => <PlanCard data={item} index={index} />,
        [],
    );
    const handleNavigation = useCallback(() => {
        router.push('/plans');
    }, []);
    const renderEmptylist = useCallback(
        () => (
            <View
                className='mb-20 mt-10'
                style={{
                    // had to use this hack because for some reason it
                    // wasn't filling the screen width
                    width: width - 40,
                }}
            >
                <EmptyList message="Looks like you haven't created any plans yet." />
            </View>
        ),
        [],
    );

    return (
        <View className='flex flex-col space-y-1 mt-5'>
            <View className='flex flex-row w-full justify-between items-center px-5'>
                <Text style={GLOBAL_STYLESHEET.gramatikaBlack} className='text-base text-black'>
                    My plans
                </Text>

                <TouchableOpacity
                    className='flex flex-row items-center space-x-1'
                    onPress={handleNavigation}
                >
                    <Text
                        style={GLOBAL_STYLESHEET.gramatikaBold}
                        className='text-sm text-purple-700'
                    >
                        View All
                    </Text>
                    <ChevronRightIcon stroke='#9333ea' />
                </TouchableOpacity>
            </View>
            <FlashList
                estimatedItemSize={150}
                horizontal
                showsHorizontalScrollIndicator={false}
                data={plans}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListEmptyComponent={renderEmptylist}
                contentContainerStyle={{
                    paddingHorizontal: 20, // Adjust based on your shadow spread
                    paddingVertical: 10, // Adjust based on your shadow spread
                }}
                // Add style to the FlatList itself
                style={{
                    // marginHorizontal: -8, // Compensate for the padding to maintain alignment
                    marginVertical: -8,
                }}
            />
        </View>
    );
}
