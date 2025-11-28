import { StoriesRef } from '@/components/Shared/molecules/Stories';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import React, { useState } from 'react';
import { router } from 'expo-router';
import Checkbox from '@/components/Shared/atoms/Checkbox';

type NewBudgetTypeProps = {
    storiesRef: React.RefObject<StoriesRef>;
};

export default function NewBudgetType({ storiesRef }: NewBudgetTypeProps) {
    const [type, setType] = useState<'flexible' | 'fixed'>('flexible');

    return (
        <View className='flex flex-col space-y-5 justify-center h-[100%] relative px-5'>
            <View className='flex flex-col space-y-2.5'>
                <Text style={satoshiFont.satoshiBold} className='text-base text-purple-500'>
                    Decide how you'd like to budget
                </Text>
            </View>

            <View className='flex flex-col rounded-3xl border border-purple-100 p-5 bg-purple-50 space-y-5'>
                <View className='flex flex-row justify-between items-center'>
                    <TouchableOpacity
                        className='flex flex-row space-x-1.5 flex-1'
                        onPress={() => setType('fixed')}
                    >
                        <View className='mt-1.5'>
                            <Checkbox
                                size={18}
                                checkedColor='#8b5cf6'
                                checked={type === 'fixed'}
                                onChange={() => setType('fixed')}
                            />
                        </View>
                        <View className='flex flex-col flex-1'>
                            <Text style={satoshiFont.satoshiBold} className='text-base'>
                                Fixed Budget
                            </Text>
                            <Text
                                style={satoshiFont.satoshiBold}
                                className='text-sm text-purple-500'
                            >
                                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Maxime
                                rem, id aperiam tempore non corporis amet error eaque incidunt
                                adipisci voluptas iure porro natus laboriosam impedit saepe
                                voluptatibus ad nisi.
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View className='h-[1px] border-b border-purple-100 w-full' />

                <View className='flex flex-row justify-between items-center'>
                    <TouchableOpacity
                        className='flex flex-row space-x-1.5 flex-1'
                        onPress={() => setType('flexible')}
                    >
                        <View className='mt-1.5'>
                            <Checkbox
                                size={18}
                                checkedColor='#8b5cf6'
                                checked={type === 'flexible'}
                                onChange={() => setType('flexible')}
                            />
                        </View>
                        <View className='flex flex-col flex-1'>
                            <Text style={satoshiFont.satoshiBold} className='text-base'>
                                Flexible Budget
                            </Text>
                            <Text
                                style={satoshiFont.satoshiBold}
                                className='text-sm text-purple-500'
                            >
                                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Maxime
                                rem, id aperiam tempore non corporis amet error eaque incidunt
                                adipisci voluptas iure porro natus laboriosam impedit saepe
                                voluptatibus ad nisi.
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <View className='items-center self-center justify-center absolute bottom-7 w-full'>
                <View className='flex flex-row space-x-2.5 justify-between w-full'>
                    <View className='flex-1'>
                        <TouchableOpacity
                            onPress={() => {
                                router.back();
                                reset();
                            }}
                            style={{ width: '100%' }}
                            className='bg-purple-50 border border-purple-100 items-center justify-center rounded-full px-5 h-[50]'
                        >
                            <Text
                                style={satoshiFont.satoshiBlack}
                                className='text-purple-600 text-center'
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className='flex-1'>
                        <TouchableOpacity
                            style={{ width: '100%' }}
                            onPress={() =>
                                storiesRef?.current?.goToPage(storiesRef.current.currentIndex + 1)
                            }
                        >
                            <LinearGradient
                                className='flex items-center justify-center rounded-full px-5 h-[50]'
                                colors={['#c084fc', '#9333ea']}
                                style={{ width: '100%' }}
                            >
                                <Text
                                    style={satoshiFont.satoshiBlack}
                                    className='text-white text-center'
                                >
                                    Next
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}
