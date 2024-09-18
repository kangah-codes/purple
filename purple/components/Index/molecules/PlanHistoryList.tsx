import SavingPlanCard from '@/components/Plans/molecules/SavingPlanCard';
import { ChevronRightIcon } from '@/components/SVG/16x16';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Dimensions, FlatList } from 'react-native';
import { savingData } from '../constants';
import { keyExtractor } from '@/lib/utils/number';
import { usePlanStore } from '@/components/Plans/hooks';
import EmptyList from '@/components/Shared/molecules/ListStates/Empty';
import { Plan } from '@/components/Plans/schema';

const width = Dimensions.get('screen').width;

export default function PlanHistoryList() {
    const { plans } = usePlanStore();
    const renderItem = useCallback(
        ({ item, index }: { item: Plan; index: number }) => (
            <SavingPlanCard data={item} index={index} />
        ),
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
        <View className='flex flex-col space-y-5 mt-5'>
            <View className='flex flex-row w-full justify-between items-center'>
                <Text style={GLOBAL_STYLESHEET.suprapower} className='text-base text-black'>
                    My plans
                </Text>

                <TouchableOpacity
                    className='flex flex-row items-center space-x-1'
                    onPress={handleNavigation}
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
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={plans}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListEmptyComponent={renderEmptylist}
            />
        </View>
    );
}
