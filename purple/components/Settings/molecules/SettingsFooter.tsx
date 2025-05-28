import { useAuth } from '@/components/Auth/hooks';
import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import pkg from '@/package.json';
import React from 'react';
import Toast from 'react-native-toast-message';

export default function SettingsFooter() {
    const { destroySession, setOnboarded } = useAuth();

    return (
        <View className='flex flex-col space-y-2.5 mb-[100]'>
            <View className='flex flex-row justify-center'>
                <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-500'>
                    Purple v{pkg.version} {pkg.isBeta && 'beta'}
                </Text>
            </View>
            {process.env.NODE_ENV == 'development' && (
                <>
                    <TouchableOpacity
                        className='items-center self-center justify-center px-4 mt-10'
                        onPress={() => {
                            setOnboarded(false).then(() =>
                                destroySession().then(() => {
                                    Toast.show({
                                        type: 'info',
                                        props: {
                                            text1: 'Cache reset',
                                            text2: 'The entire app cache has been cleared!',
                                        },
                                    });
                                }),
                            );
                        }}
                    >
                        <LinearGradient
                            className='flex items-center justify-center rounded-full px-5 w-[200] h-[50]'
                            colors={['#F87171', '#DC2626']}
                        >
                            <Text
                                style={satoshiFont.satoshiBlack}
                                className='text-white text-center'
                            >
                                Reset App Cache
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}
