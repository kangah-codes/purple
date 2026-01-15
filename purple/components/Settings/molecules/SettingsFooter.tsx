import { LinearGradient, Text, TouchableOpacity, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { useFeatureFlag } from '@/lib/hooks/useFeatureFlags';
import { useScheduleNotification } from '@/lib/hooks/useScheduleNotification';
import pkg from '@/package.json';
import React from 'react';

export default function SettingsFooter() {
    const { flush, flushQueue } = useAnalytics();
    const { scheduleNotification } = useScheduleNotification();
    const showAnalyticsDebug = useFeatureFlag('analytics_debug');
    return (
        <View className='flex flex-col space-y-2.5 mb-[100]'>
            <View className='flex flex-row justify-center'>
                <Text style={satoshiFont.satoshiBold} className='text-xs text-purple-500'>
                    Purple v{pkg.version} {pkg.isBeta && 'beta'}
                </Text>
            </View>
            {showAnalyticsDebug && (
                <>
                    <TouchableOpacity
                        className='items-center self-center justify-center px-4 mt-2.5'
                        onPress={flush}
                    >
                        <LinearGradient
                            className='flex items-center justify-center rounded-full px-5 w-[200] h-[50]'
                            colors={['#497d00', '#3c6300']}
                        >
                            <Text
                                style={satoshiFont.satoshiBlack}
                                className='text-white text-center'
                            >
                                Flush Analytics
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className='items-center self-center justify-center px-4 mt-2.5'
                        onPress={flushQueue}
                    >
                        <LinearGradient
                            className='flex items-center justify-center rounded-full px-5 w-[200] h-[50]'
                            colors={['#00a6f4', '#0069a8']}
                        >
                            <Text
                                style={satoshiFont.satoshiBlack}
                                className='text-white text-center'
                            >
                                Clear Analytics
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}
