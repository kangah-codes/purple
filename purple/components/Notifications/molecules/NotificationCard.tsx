import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import React from 'react';

type NotificationCardProps = {
    emoji: string;
    title: string;
    message: string;
};

export default function NotificationCard({ emoji, title, message }: NotificationCardProps) {
    return (
        <TouchableOpacity className='w-full bg-purple-50 border border-purple-100 rounded-3xl flex flex-row justify-between p-3.5 space-x-2.5'>
            {/* <View className='relative items-center justify-center flex rounded-xl h-10 w-10 bg-purple-100'>
                <Text className='absolute text-lg'>{emoji}</Text>
            </View> */}
            <View className='flex flex-col space-y-1 flex-1'>
                <Text className='text-sm text-black flex-1 mr-2' style={satoshiFont.satoshiBold}>
                    {title}
                </Text>
                <View>
                    <Text className='text-xs text-purple-600' style={satoshiFont.satoshiMedium}>
                        {message}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
