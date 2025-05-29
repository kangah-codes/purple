import { Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import React from 'react';

type OnboardingPageProps = {
    title: string;
    description: string;
    image: React.ReactNode;
    currentIndex?: number;
    pages: number;
};

export default function OnboardingPage({
    title,
    description,
    image,
    currentIndex,
    pages,
}: OnboardingPageProps) {
    return (
        <View className='flex flex-col space-y-5 justify-center px-5 h-[100%] bg-purple-50 relative'>
            <>{image}</>
            <View className='flex flex-col space-y-2.5'>
                <Text style={satoshiFont.satoshiBlack} className='text-4xl text-black'>
                    {title}
                </Text>
                <Text style={satoshiFont.satoshiBold} className='text-sm text-purple-500'>
                    {description}
                </Text>
            </View>
        </View>
    );
}
