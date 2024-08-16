import SavingPlanCard from '@/components/Plans/molecules/SavingPlanCard';
import { ChevronRightIcon } from '@/components/SVG/16x16';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { FlatList } from 'react-native';
import { savingData } from '../constants';
import { keyExtractor } from '@/lib/utils/number';

export default function PlanHistoryList() {
    const renderItem = useCallback(
        ({ item, index }: { item: any; index: number }) => (
            <SavingPlanCard data={item} index={index} />
        ),
        [],
    );
    const handleNavigation = useCallback(() => {
        router.push('/plans');
    }, []);

    return (
        <View className='flex flex-col space-y-5'>
            <View className='flex flex-row w-full justify-between items-center'>
                <Text style={GLOBAL_STYLESHEET.suprapower} className='text-base text-black'>
                    My saving plans
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
                data={savingData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
            />
        </View>
    );
}
