import { ScrollView, Text, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import React from 'react';
import { spendOverviewPalette } from '../contants';

type Props = {
    weekRanges: string[];
};

export default function WeekLegend({ weekRanges }: Props) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
                paddingTop: 8,
                paddingBottom: 16,
                gap: 12,
            }}
        >
            {weekRanges.map((range, i) => (
                <View key={i} className='flex flex-row justify-center items-center space-x-2.5'>
                    <View
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: 3,
                            backgroundColor: spendOverviewPalette[i % spendOverviewPalette.length],
                        }}
                    />
                    <Text style={GLOBAL_STYLESHEET.satoshiBold} className='tracking-tight text-xs'>
                        {range}
                    </Text>
                </View>
            ))}
        </ScrollView>
    );
}
