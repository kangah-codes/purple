import { TouchableOpacity, View } from '@/components/Shared/styled';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/SVG/icons/24x24';
import { satoshiFont } from '@/lib/constants/fonts';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolateColor,
} from 'react-native-reanimated';

type StatsNavigationAreaProps = {
    currentMonthIndex: number;
    setCurrentMonthIndex: React.Dispatch<React.SetStateAction<number>>;
    currentDate: Date;
    setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
    availableMonths: Date[];
    goToPreviousMonth: () => void;
    goToNextMonth: () => void;
};

export default function StatsNavigationArea({
    currentMonthIndex,
    currentDate,
    availableMonths,
    goToNextMonth,
    goToPreviousMonth,
}: StatsNavigationAreaProps) {
    const textOpacity = useSharedValue(1);
    const textTranslateY = useSharedValue(0);
    const [displayedText, setDisplayedText] = useState(`${format(currentDate, 'MMM yyyy')} Report`);
    const leftButtonEnabled = useSharedValue(currentMonthIndex > 0 ? 1 : 0);
    const rightButtonEnabled = useSharedValue(
        currentMonthIndex < availableMonths.length - 1 ? 1 : 0,
    );
    const [leftStroke, setLeftStroke] = useState('#9CA3AF');
    const [rightStroke, setRightStroke] = useState('#9CA3AF');
    const animatedTextStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }],
    }));
    const leftButtonStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(leftButtonEnabled.value, [0, 1], ['#f3f4f6', '#faf5ff']),
    }));
    const rightButtonStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(rightButtonEnabled.value, [0, 1], ['#f3f4f6', '#faf5ff']),
    }));

    useEffect(() => {
        leftButtonEnabled.value = withSpring(currentMonthIndex > 0 ? 1 : 0, {
            damping: 15,
            stiffness: 150,
        });
        rightButtonEnabled.value = withSpring(
            currentMonthIndex < availableMonths.length - 1 ? 1 : 0,
            { damping: 15, stiffness: 150 },
        );

        setLeftStroke(currentMonthIndex > 0 ? '#9333EA' : '#9CA3AF');
        setRightStroke(currentMonthIndex < availableMonths.length - 1 ? '#9333EA' : '#9CA3AF');
    }, [currentMonthIndex, availableMonths.length]);

    useEffect(() => {
        const newText = `${format(currentDate, 'MMM yyyy')} Report`;
        if (displayedText !== newText) {
            textOpacity.value = withSpring(0, { damping: 15, stiffness: 150 });
            textTranslateY.value = withSpring(-10, { damping: 15, stiffness: 150 });

            setTimeout(() => {
                setDisplayedText(newText);
                textTranslateY.value = 10;
                textOpacity.value = withSpring(1, { damping: 15, stiffness: 150 });
                textTranslateY.value = withSpring(0, { damping: 15, stiffness: 150 });
            }, 150);
        }
    }, [currentDate, displayedText]);

    return (
        <View className='w-full flex flex-row my-2.5 justify-between items-center relative px-5'>
            <TouchableOpacity
                onPress={goToPreviousMonth}
                disabled={currentMonthIndex <= 0}
                activeOpacity={0.7}
            >
                <Animated.View
                    style={[
                        {
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 999,
                        },
                        leftButtonStyle,
                    ]}
                >
                    <ArrowLeftIcon stroke={leftStroke} strokeWidth={2.5} />
                </Animated.View>
            </TouchableOpacity>

            <View className='absolute left-0 right-0 items-center'>
                <Animated.Text
                    style={[
                        satoshiFont.satoshiBlack,
                        { fontSize: 18, lineHeight: 24 },
                        animatedTextStyle,
                    ]}
                >
                    {displayedText}
                </Animated.Text>
            </View>

            <TouchableOpacity
                onPress={goToNextMonth}
                disabled={currentMonthIndex >= availableMonths.length - 1}
                activeOpacity={0.7}
            >
                <Animated.View
                    style={[
                        {
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 999,
                        },
                        rightButtonStyle,
                    ]}
                >
                    <ArrowRightIcon stroke={rightStroke} strokeWidth={2.5} />
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
}
