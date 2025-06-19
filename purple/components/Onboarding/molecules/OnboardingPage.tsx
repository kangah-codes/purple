import { StoriesRef } from '@/components/Shared/molecules/Stories';
import { Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/SVG/icons/24x24';
import { satoshiFont } from '@/lib/constants/fonts';
import React from 'react';

type OnboardingPageProps = {
    title: string;
    description: string;
    image: React.ReactNode;
    currentIndex?: number;
    pages: number;
    storiesRef: React.RefObject<StoriesRef>;
};

export default function OnboardingPage({
    title,
    description,
    image,
    currentIndex,
    pages,
    storiesRef,
}: OnboardingPageProps) {
    return (
        <View className='flex flex-col space-y-5 justify-center h-[100%] relative'>
            <View className='px-5'>{image}</View>
            <View className='flex flex-col space-y-2.5 px-5'>
                <Text style={satoshiFont.satoshiBlack} className='text-4xl text-black'>
                    {title}
                </Text>
                <Text style={satoshiFont.satoshiBold} className='text-sm text-purple-500'>
                    {description}
                </Text>
            </View>

            <View className='w-full flex flex-row py-2.5 justify-center items-center absolute bottom-5 space-x-2.5'>
                <View className='bg-purple-200 border border-purple-300 flex flex-row space-x-2.5 p-2.5 rounded-full'>
                    <TouchableOpacity
                        onPress={() =>
                            storiesRef?.current?.goToPage(storiesRef.current.currentIndex - 1)
                        }
                        className='bg-[#ad46ff] px-4 py-2 flex items-center justify-center rounded-full'
                    >
                        <ArrowLeftIcon stroke='#fff' strokeWidth={2.5} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() =>
                            storiesRef?.current?.goToPage(storiesRef.current.currentIndex + 1)
                        }
                        className='bg-[#ad46ff] px-4 py-2 flex items-center justify-center rounded-full'
                    >
                        <ArrowRightIcon stroke='#fff' strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
