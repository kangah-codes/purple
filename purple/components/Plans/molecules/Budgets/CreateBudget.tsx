/* eslint-disable @typescript-eslint/no-require-imports */
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import tw from 'twrnc';

export default function CreateBudget() {
    return (
        <View className='flex-1 w-full flex flex-col justify-center p-5'>
            <View>
                <Image source={require('@/assets/images/graphics/4.png')} style={tw`h-22 w-22`} />
            </View>
            <View className='flex flex-col space-y-2.5 mb-20'>
                <Text style={satoshiFont.satoshiBlack} className='text-2xl'>
                    Create a budget
                </Text>
                <Text style={satoshiFont.satoshiBold} className='text-sm text-purple-500'>
                    Start managing your finances by setting up a budget tailored to your needs.
                </Text>
                <View className='pt-5'>
                    <TouchableOpacity
                        className='self-start'
                        onPress={() => router.push('/plans/new')}
                    >
                        <LinearGradient
                            className='rounded-full justify-center items-center px-5 py-3'
                            colors={['#c084fc', '#9333ea']}
                        >
                            <Text style={satoshiFont.satoshiBold} className='text-sm text-white'>
                                Create my budget
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
