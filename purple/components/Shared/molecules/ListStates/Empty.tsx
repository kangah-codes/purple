import { Text, View } from '@/components/Shared/styled';
import { EMPTY_LIST_STATES } from '@/lib/constants/emptyListStates';
import { satoshiFont } from '@/lib/constants/fonts';
import { pickRandom } from '@/lib/utils/array';
import { Image, ImageSource } from 'expo-image';
import React from 'react';

type EmptyListProps = {
    message?: string;
    title?: string;
    image?: string | number | ImageSource | ImageSource[] | string[] | null | undefined;
    imageDetails?: {
        showImage?: boolean;
        width?: number;
        height?: number;
    };
};

export default function EmptyList({
    message,
    title,
    image,
    imageDetails = { showImage: true, width: 200, height: 200 },
}: EmptyListProps) {
    const msg = pickRandom(EMPTY_LIST_STATES);
    const { showImage = true, width = 200, height = 200 } = imageDetails ?? {};

    return (
        <View className='flex flex-col items-center justify-center px-5'>
            {showImage && (
                <Image
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    source={image ? image : require('@/assets/images/graphics/20.png')}
                    style={{
                        width,
                        height,
                    }}
                />
            )}
            <View className='flex flex-col'>
                <Text style={satoshiFont.satoshiBlack} className='text-lg text-black text-center'>
                    {title ?? msg.title}
                </Text>
                <Text
                    style={satoshiFont.satoshiBold}
                    className='text-sm text-purple-500 text-center'
                >
                    {message ?? msg.message}
                </Text>
            </View>
        </View>
    );
}
