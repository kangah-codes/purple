/* eslint-disable @typescript-eslint/no-require-imports */
import Stories, { StoriesRef } from '@/components/Shared/molecules/Stories';
import { View } from '@/components/Shared/styled';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import React, { useRef } from 'react';
import { Image } from 'react-native';
import tw from 'twrnc';
import NewPlanLimits from '../molecules/NewBudget/NewPlanLimits';
import NewPlanDateRange from '../molecules/NewBudget/NewPlanDateRange';
import NewPlanAllocation from '../molecules/NewBudget/NewPlanAllocation';
import NewBudgetType from '../molecules/NewBudget/NewBudgetType';

export default function NewPlanScreen() {
    const storiesRef = useRef<StoriesRef>(null);
    const pages = [
        <NewBudgetType storiesRef={storiesRef} />,
        <NewPlanLimits storiesRef={storiesRef} />,
        <NewPlanDateRange storiesRef={storiesRef} />,
        <NewPlanAllocation storiesRef={storiesRef} />,
    ];

    return (
        <View className='w-full h-[100%]'>
            <Image
                source={require('@/assets/images/graphics/gradient-2.png')}
                style={tw`rounded-3xl w-full h-full absolute`}
            />
            <ExpoStatusBar style='dark' />
            <Stories
                pages={pages}
                ref={storiesRef}
                enableNavigation={false}
                disableAutomaticScroll
                style={tw`bg-white`}
            />
        </View>
    );
}
