import { format } from 'date-fns';
import React, { useEffect } from 'react';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { Text, TouchableOpacity } from '@/components/Shared/styled';
import tw from 'twrnc';
import { satoshiFont } from '@/lib/constants/fonts';

export default function MonthCard({
    month,
    index,
    isActive,
    goToMonth,
}: {
    month: Date;
    index: number;
    isActive: boolean;
    goToMonth: (index: number) => void;
}) {
    const scale = useSharedValue(isActive ? 1.05 : 1);
    const opacity = useSharedValue(isActive ? 1 : 0.7);

    useEffect(() => {
        scale.value = withSpring(isActive ? 1.05 : 1, {
            damping: 15,
            stiffness: 150,
        });
        opacity.value = withSpring(isActive ? 1 : 0.7, {
            damping: 15,
            stiffness: 150,
        });
    }, [isActive, scale, opacity]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => goToMonth(index)}
            style={[isActive && tw`bg-purple-50 border-purple-500`]}
            className='w-[72px] h-[50px] rounded-2xl items-center justify-center mr-2'
        >
            <Animated.View style={animatedStyle}>
                <Text style={[satoshiFont.satoshiBlack, isActive && tw`text-purple-500`]}>
                    {format(month, 'MMM').toUpperCase()}
                </Text>
                <Text
                    style={[
                        satoshiFont.satoshiBold,
                        isActive ? tw`text-purple-400` : tw`text-purple-500`,
                    ]}
                    className='text-xs'
                >
                    {format(month, 'yyyy')}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
}
