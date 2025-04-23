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
                <View
                    key={i}
                    className='bg-purple-50 flex flex-row justify-center items-center space-x-2 px-4 py-2 rounded-full'
                >
                    <View
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: weekColors[i % weekColors.length],
                        }}
                    />
                    <Text style={GLOBAL_STYLESHEET.satoshiBold} className='tracking-tight text-xs'>
                        Week {i + 1} ({range})
                    </Text>
                </View>
            ))}
        </ScrollView>
    );
}
