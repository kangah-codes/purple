import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { formatCurrencyAccurate } from '@/lib/utils/number';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const BUTTONS = [
    ['AC', '( )', 'X', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', 'Save'],
];

const AnimatedContainer = Animated.createAnimatedComponent(View);

export default function NewTransactionNumberInput() {
    const [input, setInput] = useState('');
    const [total, setTotal] = useState('');

    const operators = ['+', '-', '×', '÷', '.'];

    const height = useSharedValue(64); // base height for input only
    const paddingBottom = useSharedValue(0);

    useEffect(() => {
        if (total) {
            // expand container when total is visible
            height.value = withSpring(90, { damping: 12, stiffness: 120 });
            paddingBottom.value = withSpring(4);
        } else {
            // shrink back when total disappears
            height.value = withSpring(60, { damping: 12, stiffness: 120 });
            paddingBottom.value = withSpring(0);
        }
    }, [total]);

    const animatedStyle = useAnimatedStyle(() => ({
        height: total
            ? withSpring(90, { damping: 12, stiffness: 120 })
            : withSpring(64, { damping: 12, stiffness: 120 }),
    }));

    // Function to safely evaluate valid math expressions
    const evaluateExpression = (expr: string) => {
        try {
            // Only evaluate if brackets are balanced
            const openCount = (expr.match(/\(/g) || []).length;
            const closeCount = (expr.match(/\)/g) || []).length;
            if (openCount !== closeCount) return;

            const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/');
            const lastChar = sanitized.slice(-1);
            if (['+', '-', '*', '/'].includes(lastChar)) return;

            // eslint-disable-next-line no-eval
            const result = eval(sanitized);
            setTotal(result.toString());
        } catch {
            setTotal('');
        }
    };

    const handlePress = (value: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        switch (value) {
            case 'AC':
                setInput('');
                setTotal('');
                return;

            case 'X':
                setInput((prev) => prev.slice(0, -1));
                return;

            case '( )': {
                const lastChar = input.slice(-1);
                const openCount = (input.match(/\(/g) || []).length;
                const closeCount = (input.match(/\)/g) || []).length;

                if (input === '' || operators.includes(lastChar) || lastChar === '(') {
                    setInput((prev) => prev + '(');
                } else if (openCount > closeCount) {
                    setInput((prev) => prev + ')');
                } else {
                    setInput((prev) => prev + '(');
                }
                return;
            }

            default:
                const lastChar = input.slice(-1);
                if (operators.includes(value) && (input === '' || operators.includes(lastChar)))
                    return;
                setInput((prev) => prev + value);
        }
    };

    // Evaluate whenever input changes
    useEffect(() => {
        evaluateExpression(input);
    }, [input]);

    return (
        <View className='w-full flex flex-col space-y-2.5'>
            <AnimatedContainer
                className='w-full bg-purple-50 border border-purple-100 rounded-full px-[30px]'
                style={[
                    {
                        overflow: 'hidden', // important for spring animation
                    },
                    animatedStyle,
                ]}
            >
                <View
                    style={{
                        justifyContent: 'center',
                        minHeight: 64,
                    }}
                    className='my-auto'
                >
                    <Text
                        style={[satoshiFont.satoshiBlack, { textAlign: 'right' }]}
                        className='text-2xl'
                    >
                        {input || '0'}
                    </Text>
                    {total && (
                        <Text
                            style={[
                                satoshiFont.satoshiBold,
                                {
                                    textAlign: 'right',
                                    color: '#9333ea',
                                    fontSize: 18,
                                    marginTop: 4,
                                },
                            ]}
                        >
                            = {formatCurrencyAccurate('GHS', Number(total))}
                        </Text>
                    )}
                </View>
            </AnimatedContainer>

            {/* Buttons */}
            {BUTTONS.map((row, rowIndex) => (
                <View key={rowIndex} className='w-full flex flex-row space-x-2.5'>
                    {row.map((value) => {
                        const isSave = value === 'Save';
                        return (
                            <LinearGradient
                                key={value}
                                className='rounded-full justify-center items-center'
                                style={{ flex: isSave ? 2 : 1 }}
                                colors={isSave ? ['#c084fc', '#9333ea'] : ['#faf5ff', '#f3e8ff']}
                            >
                                <TouchableOpacity
                                    onPress={() => handlePress(value)}
                                    className='rounded-full w-full h-[64px] flex items-center justify-center'
                                >
                                    <Text
                                        style={[
                                            satoshiFont.satoshiBlack,
                                            {
                                                fontSize: isSave ? 18 : 24,
                                                color: isSave ? '#fff' : '#9333ea',
                                            },
                                        ]}
                                        selectable={false}
                                    >
                                        {value}
                                    </Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        );
                    })}
                </View>
            ))}
        </View>
    );
}
