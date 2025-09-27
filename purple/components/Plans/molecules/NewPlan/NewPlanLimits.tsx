import { StoriesRef } from '@/components/Shared/molecules/Stories';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { ArrowRightIcon, MinusIcon, PlusIcon } from '@/components/SVG/icons/24x24';
import { satoshiFont } from '@/lib/constants/fonts';
import { formatCurrencyRounded } from '@/lib/utils/number';
import { router } from 'expo-router';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

type NewPlanLimitsProps = {
    storiesRef: React.RefObject<StoriesRef>;
};

export default function NewPlanLimits({ storiesRef }: NewPlanLimitsProps) {
    const [amount, setAmount] = useState(100);
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState('100');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const holdDurationRef = useRef(0);

    // Clear any active timers
    const clearTimers = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        holdDurationRef.current = 0;
    }, []);

    // Calculate increment based on hold duration
    const getIncrement = useCallback((holdDuration: number) => {
        if (holdDuration < 1000) return 10; // First 1s: +10
        if (holdDuration < 3000) return 25; // 1-3s: +25
        if (holdDuration < 5000) return 50; // 3-5s: +50
        if (holdDuration < 8000) return 100; // 5-8s: +100
        return 250; // 8s+: +250
    }, []);

    // Handle continuous increment/decrement
    const startContinuousChange = useCallback(
        (increment: number) => {
            clearTimers();
            const startTime = Date.now();

            // Initial delay before continuous change starts
            timeoutRef.current = setTimeout(() => {
                // Medium haptic feedback when continuous change starts
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                let lastIncrement = 0;
                intervalRef.current = setInterval(() => {
                    holdDurationRef.current = Date.now() - startTime;
                    const currentIncrement = getIncrement(holdDurationRef.current);

                    // Heavy haptic feedback when increment level increases
                    if (currentIncrement > lastIncrement) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                        lastIncrement = currentIncrement;
                    }

                    setAmount((prev) => {
                        const newAmount =
                            prev + (increment > 0 ? currentIncrement : -currentIncrement);
                        return Math.max(0, newAmount); // Prevent negative amounts
                    });
                }, 100); // Update every 100ms for smooth acceleration
            }, 500); // Start continuous after 500ms hold
        },
        [clearTimers, getIncrement],
    );

    const handlePressIn = useCallback(
        (increment: number) => {
            // Light haptic feedback for initial press
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            // Immediate single increment
            setAmount((prev) => {
                const newAmount = prev + increment;
                return Math.max(0, newAmount);
            });

            // Start continuous change
            startContinuousChange(increment);
        },
        [startContinuousChange],
    );

    const handlePressOut = useCallback(() => {
        clearTimers();
    }, [clearTimers]);

    // Handle text input mode
    const handleAmountPress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsEditing(true);
        setInputValue(amount.toString());
    }, [amount]);

    const handleInputSubmit = useCallback(() => {
        const newAmount = parseInt(inputValue, 10);
        if (!isNaN(newAmount) && newAmount >= 0) {
            setAmount(newAmount);
        }
        setIsEditing(false);
    }, [inputValue]);

    const handleInputBlur = useCallback(() => {
        handleInputSubmit();
    }, [handleInputSubmit]);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            clearTimers();
        };
    }, [clearTimers]);
    return (
        <View className='flex flex-col space-y-5 justify-center h-[100%] relative px-5'>
            <View className='flex flex-col space-y-2.5'>
                <Text style={satoshiFont.satoshiBold} className='text-base text-purple-500'>
                    How much do you want to budget?
                </Text>
            </View>

            <View className='flex flex-row justify-between items-center'>
                <Pressable
                    onPressIn={() => handlePressIn(-1)}
                    onPressOut={handlePressOut}
                    style={({ pressed }) => ({
                        backgroundColor: '#f3e8ff',
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 9999,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: pressed ? 0.7 : 1,
                        transform: pressed ? [{ scale: 0.95 }] : [{ scale: 1 }],
                    })}
                >
                    <MinusIcon stroke='#9810fa' strokeWidth={2.5} width={18} height={18} />
                </Pressable>

                {isEditing ? (
                    <TextInput
                        value={inputValue}
                        onChangeText={setInputValue}
                        onSubmitEditing={handleInputSubmit}
                        onBlur={handleInputBlur}
                        keyboardType='numeric'
                        autoFocus
                        selectTextOnFocus
                        style={[
                            satoshiFont.satoshiBlack,
                            {
                                fontSize: 36,
                                color: '#000000',
                                textAlign: 'center',
                                minWidth: 150,
                                borderBottomWidth: 2,
                                borderBottomColor: '#9810fa',
                                paddingBottom: 4,
                            },
                        ]}
                    />
                ) : (
                    <Pressable onPress={handleAmountPress}>
                        <Text style={satoshiFont.satoshiBlack} className='text-4xl text-black'>
                            {formatCurrencyRounded(amount, 'GHS')}
                        </Text>
                    </Pressable>
                )}

                <Pressable
                    onPressIn={() => handlePressIn(1)}
                    onPressOut={handlePressOut}
                    style={({ pressed }) => ({
                        backgroundColor: '#f3e8ff',
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 9999,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: pressed ? 0.7 : 1,
                        transform: pressed ? [{ scale: 0.95 }] : [{ scale: 1 }],
                    })}
                >
                    <PlusIcon stroke='#9810fa' strokeWidth={2.5} width={18} height={18} />
                </Pressable>
            </View>

            <View className='absolute bottom-8 left-5 right-5 flex-row justify-between items-center'>
                <TouchableOpacity
                    onPress={() => {
                        if (storiesRef?.current?.currentIndex === 0) {
                            router.back();
                            return;
                        }
                        storiesRef?.current?.goToPage(storiesRef.current.currentIndex - 1);
                    }}
                >
                    <Text style={satoshiFont.satoshiBlack} className='text-sm text-purple-500'>
                        Back
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() =>
                        storiesRef?.current?.goToPage(storiesRef.current.currentIndex + 1)
                    }
                    className='bg-purple-300 px-4 py-2.5 w-[75px] flex items-center justify-center rounded-full'
                >
                    <ArrowRightIcon stroke='#9810fa' strokeWidth={2.5} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
