import { ExternalLink } from '@/components/Shared/molecules/ExternalLink';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { GLOBAL_STYLESHEET } from '@/constants/Stylesheet';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import tw from 'twrnc';

export default function Landing() {
    return (
        <View className='bg-white relative h-full flex flex-col items-stretch'>
            <ExpoStatusBar style='dark' />
            <View className='bg-purple-100 flex-grow flex items-center justify-center'>
                <Image
                    source={require('@/assets/images/graphics/12.png')}
                    style={tw`h-72 w-72 mt-10`}
                />
            </View>
            <View className='w-full px-5 space-y-5 flex flex-col items-center justify-center bg-white flex-grow'>
                <View className='flex flex-col space-y-2.5'>
                    <Text
                        style={{ fontFamily: 'Suprapower' }}
                        className='text-2xl text-black text-center'
                    >
                        Take your personal finance into your own hands!
                    </Text>
                    <Text
                        style={{ fontFamily: 'InterMedium' }}
                        className='text-sm textblack text-center'
                    >
                        Enjoy a seamless experience with Purple and take control of your finances
                        today!
                    </Text>
                </View>

                <View className='flex flex-col space-y-2.5 w-full'>
                    <TouchableOpacity
                        className='w-full'
                        onPress={() => router.replace('/auth/sign-up')}
                    >
                        <LinearGradient
                            className='flex items-center justify-center rounded-full px-5 py-2.5'
                            colors={['#c084fc', '#9333ea']}
                        >
                            <Text
                                style={{ fontFamily: 'InterBold' }}
                                className='text-base text-white tracking-tight'
                            >
                                Sign Up
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className='w-full'
                        onPress={() => router.replace('/auth/sign-in')}
                    >
                        <View className='flex items-center justify-center rounded-full px-5 py-2.5 bg-gray-100'>
                            <Text
                                style={GLOBAL_STYLESHEET.interSemiBold}
                                className='text-base text-black tracking-tight'
                            >
                                Sign In
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <ExternalLink href='https://purpleapp.vercel.app'>
                        <Text
                            style={{ fontFamily: 'InterBold' }}
                            className='text-xs text-purple-500 text-center'
                        >
                            Terms and Conditions
                        </Text>
                    </ExternalLink>
                </View>
            </View>
        </View>
    );
}
