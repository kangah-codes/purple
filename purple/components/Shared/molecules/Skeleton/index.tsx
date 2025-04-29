import React from 'react';
import { View } from '@/components/Shared/styled';
import tw from 'twrnc';
import AnimatedSkeleton from '@/components/Shared/atoms/Skeleton';
import { StyleProp, ViewStyle } from 'react-native';

export const SkeletonLine = ({
    width,
    height = 5,
    style,
}: {
    width: number | string;
    height?: number;
    style?: StyleProp<ViewStyle>;
}) => <AnimatedSkeleton style={[tw`rounded-lg`, { width, height }, style]} />;

export const SkeletonCircle = ({ size = 40 }) => (
    <AnimatedSkeleton style={[tw`rounded-full`, { width: size, height: size }]} />
);

export const SkeletonListItem = () => (
    <View style={tw`flex-row justify-between items-center mb-2.5`}>
        <View style={tw`flex-row items-center`}>
            <SkeletonCircle size={40} />
            <View className='ml-2.5 flex flex-col'>
                <SkeletonLine width={80} height={16} />
                <SkeletonLine width={40} height={16} style={{ marginTop: 5 }} />
            </View>
        </View>
        <SkeletonLine width={80} height={20} />
    </View>
);

export const PieChartSkeleton = () => (
    <View style={tw`space-y-5 flex flex-col`}>
        <View style={tw`flex-row justify-between items-center`}>
            <SkeletonLine width={120} height={24} />
            <SkeletonLine width={60} height={20} />
        </View>

        <View style={tw`flex-row items-center justify-between mt-5`}>
            {/* Circular chart placeholder */}
            <View style={tw`relative`}>
                <SkeletonCircle size={200} />
                {/* Inner circle for donut effect */}
                <View
                    style={[
                        tw`absolute bg-white rounded-full`,
                        {
                            width: 150,
                            height: 150,
                            left: 25,
                            top: 25,
                        },
                    ]}
                />
            </View>

            {/* Legend */}
            <View style={tw`space-y-4`}>
                {[...Array(4)].map((_, i) => (
                    <View key={`legend-${i}`} style={tw`flex-row items-center mt-2`}>
                        <SkeletonCircle size={16} />
                        <View style={tw`ml-2`}>
                            <SkeletonLine width={80} height={16} />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    </View>
);

export const LineChartSkeleton = () => {
    return (
        <View style={tw`space-y-4`}>
            <View style={tw`flex-row justify-between items-center`}>
                <SkeletonLine width={120} height={24} />
                <SkeletonLine width={60} height={20} />
            </View>

            {/* Line Chart Grid Lines */}
            <View style={tw`relative h-64 w-full mt-5`}>
                {/* Y-axis labels */}
                <View style={tw`absolute left-0 h-full justify-between py-2`}>
                    {[...Array(5)].map((_, i) => (
                        <SkeletonLine key={`y-${i}`} width={32} height={16} />
                    ))}
                </View>

                {/* Chart area with "trend line" */}
                <View style={tw`ml-12 flex-1`}>
                    {/* Background grid lines */}
                    {[...Array(5)].map((_, i) => (
                        <View key={`grid-${i}`} style={tw`border-t border-purple-100 flex-1`} />
                    ))}

                    {/* Trend line */}
                    <View style={tw`absolute inset-0`}>
                        {/* Single wide skeleton line for the trend */}
                        <View style={[tw`absolute`, { top: '40%' }]}>
                            <SkeletonLine width='100%' height={3} />
                        </View>

                        {/* Dots at data points */}
                        {[...Array(6)].map((_, i) => (
                            <View
                                key={`dot-${i}`}
                                style={[
                                    tw`absolute`,
                                    {
                                        left: `${i * 20}%`,
                                        top: `${40 + (i % 2 ? 10 : -10)}%`,
                                    },
                                ]}
                            >
                                <SkeletonCircle size={8} />
                            </View>
                        ))}
                    </View>
                </View>

                {/* X-axis labels */}
                <View style={tw`flex-row justify-between mt-2`}>
                    {[...Array(6)].map((_, i) => (
                        <SkeletonLine key={`x-${i}`} width={32} height={16} />
                    ))}
                </View>
            </View>
        </View>
    );
};
