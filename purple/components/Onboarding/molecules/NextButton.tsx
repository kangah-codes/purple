import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import React from 'react';

export default function NextButton(props: any) {
    return (
        <View className='px-5'>
            <TouchableOpacity {...props}>
                <LinearGradient
                    className='flex items-center justify-center rounded-full px-5 py-2'
                    colors={['#c084fc', '#9333ea']}
                >
                    <Text style={{ fontFamily: 'GramatikaBlack' }} className='text-sm text-white'>
                        Next
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

export function SkipButton(props: any) {
    return (
        <View className='px-5'>
            <TouchableOpacity {...props}>
                <LinearGradient
                    className='flex items-center justify-center rounded-full px-5 py-2'
                    colors={['#c084fc', '#9333ea']}
                >
                    <Text style={{ fontFamily: 'GramatikaBlack' }} className='text-sm text-white'>
                        Skip
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}
