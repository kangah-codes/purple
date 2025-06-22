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
            <TouchableOpacity
                className='absolute z-10 top-24 right-5'
                onPress={() => {
                    storiesRef.current?.goToPage(storiesRef.current.totalPages - 1);
                }}
            >
                <Text style={satoshiFont.satoshiBlack} className='text-sm text-purple-500'>
                    Skip
                </Text>
            </TouchableOpacity>
            <View className='px-5'>{image}</View>
            <View className='flex flex-col space-y-2.5 px-5'>
                <Text style={satoshiFont.satoshiBlack} className='text-4xl text-black'>
                    {title}
                </Text>
                <Text style={satoshiFont.satoshiBold} className='text-sm text-purple-500'>
                    {description}
                </Text>
            </View>

            <View className='absolute bottom-5 left-5 right-5 flex-row justify-between items-center'>
                <TouchableOpacity
                    onPress={() =>
                        storiesRef?.current?.goToPage(storiesRef.current.currentIndex - 1)
                    }
                >
                    <Text style={satoshiFont.satoshiBlack} className='text-sm text-purple-500'>
                        Back
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() =>
                        storiesRef?.current?.goToPage(storiesRef.current.currentIndex + 1)
                    }
                    className='bg-purple-300 px-4 py-2.5 w-[75px] flex items-center justify-center rounded-full'
                >
                    <ArrowRightIcon stroke='#9810fa' strokeWidth={2.5} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
