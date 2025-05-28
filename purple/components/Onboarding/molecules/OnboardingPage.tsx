import { useCreateAccount } from '@/components/Accounts/hooks';
import { useAuth } from '@/components/Auth/hooks';
import { usePreferences } from '@/components/Settings/hooks';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { nativeStorage } from '@/lib/utils/storage';
import React from 'react';
import Toast from 'react-native-toast-message';

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
    const { setOnboarded, setSessionData } = useAuth();
    const {
        preferences: { currency },
    } = usePreferences();
    const { mutate } = useCreateAccount();

    async function setSession() {
        setSessionData({
            access_token: '',
            access_token_expires_at: '',
            user: {
                ID: 'offline_user',
                username: 'offline_user',
                email: 'offline_user',
            },
        });
        await setOnboarded(true);
    }

    async function handleOnboarding() {
        nativeStorage.setItem('isOfflineMode', true);
        mutate(
            {
                category: '💵 Cash',
                name: 'Cash',
                balance: 0,
                currency: currency,
                is_default_account: true,
            },
            {
                onSuccess: async () => {
                    await setSession();
                },
                onError: async (error) => {
                    // a default cash account already exists
                    if (error.statusCode == 409) await setSession();
                    Toast.show({
                        type: 'error',
                        text1: 'Something went wrong!',
                        text2: "We couldn't setup Purple for you, try again later.",
                    });
                },
            },
        );
    }

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

            {currentIndex === pages - 1 && (
                <View className='flex flex-row items-center justify-center space-x-5 absolute bottom-5 w-screen'>
                    <TouchableOpacity onPress={handleOnboarding}>
                        <LinearGradient
                            className='flex items-center justify-center rounded-full px-4 py-2 w-[200] h-[50]'
                            colors={['#c084fc', '#9333ea']}
                        >
                            <Text style={satoshiFont.satoshiBold} className='text-base text-white'>
                                Let's go!
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
