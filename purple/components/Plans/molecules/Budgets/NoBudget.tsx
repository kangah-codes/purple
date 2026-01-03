/* eslint-disable @typescript-eslint/no-require-imports */
import { Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import tw from 'twrnc';

function hashSeed(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

export default function NoBudget() {
    const effectiveSeed = String(Date.now());
    const message = useMemo(() => {
        const messages = [
            {
                title: 'Oops!',
                body: 'Looks like you didn’t have a budget set up. No worries, you can still create one for future months!',
            },
            {
                title: 'No budget here…',
                body: 'This month is budget free. Future you can fix that with one tap.',
            },
            {
                title: 'Budget? Never met her.',
                body: 'Nothing saved for this month, but you can absolutely plan ahead for the next one.',
            },
            {
                title: 'Time traveler alert',
                body: 'We can’t add a budget to the past, but you can set up one for upcoming months.',
            },
            {
                title: 'All vibes, no budget',
                body: 'This month has no budget data. Let’s get the next month looking organized.',
            },
        ] as const;

        const index = hashSeed(effectiveSeed) % messages.length;
        return messages[index];
    }, [effectiveSeed]);

    return (
        <View className='flex-1 w-full flex flex-col justify-center p-5'>
            <View>
                <Image
                    source={require('@/assets/images/graphics/catto.png')}
                    style={tw`h-22 w-22`}
                />
            </View>
            <View className='flex flex-col space-y-2.5 mb-20'>
                <Text style={satoshiFont.satoshiBlack} className='text-2xl'>
                    {message.title}
                </Text>
                <Text style={satoshiFont.satoshiBold} className='text-sm text-purple-500'>
                    {message.body}
                </Text>
            </View>
        </View>
    );
}
