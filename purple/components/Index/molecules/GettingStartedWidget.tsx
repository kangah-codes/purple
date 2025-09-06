import Checkbox from '@/components/Shared/atoms/Checkbox';
import { ProgressBar } from '@/components/Shared/atoms/ProgressBar';
import { Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import React, { useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

const initialSetup = [
    { emoji: '🏦', text: 'Add an account', isCompleted: true },
    { emoji: '🗂️', text: 'Customise categories', isCompleted: false },
    { emoji: '💸', text: 'Create your first transaction', isCompleted: false },
    { emoji: '🎯', text: 'Create a saving plan', isCompleted: false },
    { emoji: '📊', text: 'Create a budget', isCompleted: false },
];

export default function GettingStartedWidget() {
    const [setup, setSetup] = useState(initialSetup);

    const handleItemPress = (index: number) => {
        const updated = [...setup];
        const currentItem = updated[index];

        // If trying to uncheck an item, allow it
        if (currentItem.isCompleted) {
            currentItem.isCompleted = false;
            // Also uncheck all subsequent items to maintain sequential completion
            for (let i = index + 1; i < updated.length; i++) {
                updated[i].isCompleted = false;
            }
        } else {
            // If trying to check an item, only allow if all previous items are completed
            const allPreviousCompleted = updated.slice(0, index).every((item) => item.isCompleted);
            if (allPreviousCompleted) {
                currentItem.isCompleted = true;
            }
            // If not all previous are completed, do nothing (item remains unchecked)
        }

        setSetup(updated);
    };

    const completedSteps = setup.filter((item) => item.isCompleted).length;

    return (
        <View
            className='w-full rounded-3xl bg-purple-50 border border-purple-100 p-5 flex flex-col space-y-5 mt-5'
            // style={styles.shadow}
        >
            <View className='flex flex-col'>
                <Text style={satoshiFont.satoshiBlack} className='text-base'>
                    Getting Started
                </Text>
                <Text style={satoshiFont.satoshiBold} className='text-sm text-purple-600'>
                    Hi there! Let's finish setting up Purple for you
                </Text>
            </View>

            <View>
                <ProgressBar steps={setup.length} currentStep={completedSteps} />
            </View>

            <View className='h-[1px] border-b border-purple-100' />

            <FlatList
                data={setup}
                keyExtractor={(item) => item.text}
                renderItem={({ item, index }) => {
                    // Determine if this item can be interacted with
                    const allPreviousCompleted = setup
                        .slice(0, index)
                        .every((prevItem) => prevItem.isCompleted);
                    const isClickable = item.isCompleted || allPreviousCompleted;

                    return (
                        <View
                            className={`flex flex-row justify-between items-center ${
                                index === 0 ? 'pb-2' : 'py-2'
                            } ${!isClickable ? 'opacity-50' : ''}`}
                        >
                            <View
                                className='flex flex-row items-center justify-center space-x-2.5'
                                onTouchEnd={() => isClickable && handleItemPress(index)}
                            >
                                <Text
                                    style={satoshiFont.satoshiBold}
                                    className='text-lg text-black'
                                >
                                    {item.emoji}
                                </Text>
                                <Text
                                    style={[
                                        satoshiFont.satoshiBold,
                                        item.isCompleted
                                            ? { textDecorationLine: 'line-through' }
                                            : {},
                                    ]}
                                    className='text-base text-black'
                                >
                                    {item.text}
                                </Text>
                            </View>

                            <View style={{ opacity: isClickable ? 1 : 0.5 }}>
                                <Checkbox
                                    checked={item.isCompleted}
                                    onChange={() => isClickable && handleItemPress(index)}
                                    disabled={true}
                                />
                            </View>
                        </View>
                    );
                }}
                ItemSeparatorComponent={() => (
                    <View className='h-[1px] border-b border-purple-100' />
                )}
                scrollEnabled={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    shadow: {
        shadowColor: '#A855F7',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
