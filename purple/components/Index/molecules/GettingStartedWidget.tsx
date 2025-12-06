import Checkbox from '@/components/Shared/atoms/Checkbox';
import { ProgressBar } from '@/components/Shared/atoms/ProgressBar';
import { Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { useStartupGuide } from '@/components/Settings/hooks/useStartupGuide';
import React, { useCallback } from 'react';
import { FlatList } from 'react-native';

export default function GettingStartedWidget() {
    const { steps, completed, total, shouldShowGuide } = useStartupGuide();

    const handleItemPress = (stepId: string, callback: () => void) => {
        callback();
        // Note: markStepCompleted will be called automatically for customize_categories
        // when a category is created, or manually for other steps
    };

    const renderItem = useCallback(
        ({ item, index }: { item: any; index: number }) => {
            const allPreviousCompleted = steps
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
                        onTouchEnd={() => isClickable && handleItemPress(item.id, item.callback)}
                    >
                        <Text style={satoshiFont.satoshiBold} className='text-lg text-black'>
                            {item.emoji}
                        </Text>
                        <Text
                            style={[
                                satoshiFont.satoshiBold,
                                item.isCompleted ? { textDecorationLine: 'line-through' } : {},
                            ]}
                            className='text-base text-black'
                        >
                            {item.text}
                        </Text>
                    </View>

                    <View style={{ opacity: isClickable ? 1 : 0.5 }}>
                        <Checkbox
                            checkedColor='#8b5cf6'
                            checked={item.isCompleted}
                            onChange={() => isClickable && handleItemPress(item.id, item.callback)}
                        />
                    </View>
                </View>
            );
        },
        [steps],
    );

    // dont show widget if startup guide is completed
    if (!shouldShowGuide) {
        return null;
    }

    return (
        <View className='w-full rounded-3xl bg-purple-50 border border-purple-100 p-5 flex flex-col space-y-5 mt-5'>
            <View className='flex flex-col'>
                <Text style={satoshiFont.satoshiBlack} className='text-base'>
                    Getting Started
                </Text>
                <Text style={satoshiFont.satoshiBold} className='text-sm text-purple-600'>
                    Hi there! Let's finish setting up Purple for you
                </Text>
            </View>

            <View>
                <ProgressBar steps={total} currentStep={completed} />
            </View>

            <View className='h-[1px] border-b border-purple-100' />

            <FlatList
                data={steps}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ItemSeparatorComponent={() => (
                    <View className='h-[1px] border-b border-purple-100' />
                )}
                scrollEnabled={false}
            />
        </View>
    );
}
