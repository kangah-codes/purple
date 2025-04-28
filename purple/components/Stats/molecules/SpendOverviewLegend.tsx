import React from 'react';
import { weekColors } from '../contants';
import { GLOBAL_STYLESHEET } from '@/lib/constants/Stylesheet';
import { ScrollView, View, Text } from '@/components/Shared/styled';

type Props = {
    weekRanges: string[];
};

export default function WeekLegend({ weekRanges }: Props) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
                paddingHorizontal: 16,
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
                            backgroundColor: weekColors[i % weekColors.length],
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
