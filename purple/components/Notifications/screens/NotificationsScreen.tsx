import { LinearGradient, SafeAreaView, View } from '@/components/Shared/styled';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React from 'react';
import {
    StatusBar as RNStatusBar,
    StyleSheet,
    NativeScrollEvent,
    NativeSyntheticEvent,
} from 'react-native';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import NotificationsNavigationArea from '../molecules/NotificationsNavigationArea';
import NotificationsAccordion from '../molecules/NotificationsAccordion';

export type NotificationData = {
    id: string;
    emoji: string;
    title: string;
    message: string;
    timeAgo: string;
    created_at: string;
};

const notifications: NotificationData[] = [
    {
        id: '1',
        emoji: '❌',
        title: 'Payment Failed',
        message:
            'Your payment to John Doe for $50.00 has failed. Please update your payment method.',
        timeAgo: '2h ago',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
        id: '2',
        emoji: '✅',
        title: 'Payment Successful',
        message: 'You have successfully sent $20.00 to Jane Smith.',
        timeAgo: '5h ago',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    },
    {
        id: '3',
        emoji: '💡',
        title: 'New Feature Available',
        message:
            'Check out the new budgeting tools in the app to help manage your finances better.',
        timeAgo: '1d ago',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
        id: '4',
        emoji: '❌',
        title: 'Payment Failed',
        message:
            'Your payment to John Doe for $50.00 has failed. Please update your payment method.',
        timeAgo: '2d ago',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
        id: '5',
        emoji: '✅',
        title: 'Payment Successful',
        message: 'You have successfully sent $20.00 to Jane Smith.',
        timeAgo: '2d ago',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
        id: '6',
        emoji: '💡',
        title: 'New Feature Available',
        message:
            'Check out the new budgeting tools in the app to help manage your finances better.',
        timeAgo: '3d ago',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
    {
        id: '7',
        emoji: '�',
        title: 'Weekly Summary',
        message: 'Your weekly spending summary is ready. You spent $150 this week.',
        timeAgo: '1w ago',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    },
    {
        id: '8',
        emoji: '⚠️',
        title: 'Budget Alert',
        message: 'You have exceeded your monthly budget for dining out.',
        timeAgo: '1w ago',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    },
];

export default function NotificationsScreen() {
    const scrollY = useSharedValue(0);
    const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        'worklet';
        scrollY.value = event.nativeEvent.contentOffset.y;
    };
    const shadowStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(scrollY.value, [0, 10], [0, 1], Extrapolation.CLAMP),
        };
    });

    return (
        <SafeAreaView className='bg-white relative h-full'>
            <ExpoStatusBar style='dark' />
            <View className='w-full relative flex-1' style={styles.parentView}>
                <NotificationsNavigationArea />
                <View className='flex-1 mt-2.5 relative'>
                    {/** //TODO: eventually i will abstract this into a hook & component to easily reuse  */}
                    <Animated.View
                        style={[
                            {
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: 0,
                                height: 10,
                                zIndex: 999,
                            },
                            shadowStyle,
                        ]}
                        pointerEvents='none'
                    >
                        <LinearGradient colors={['#faf5ff', 'transparent']} style={{ flex: 1 }} />
                    </Animated.View>

                    <NotificationsAccordion
                        notifications={notifications}
                        showTitle={false}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    parentView: {
        paddingTop: (RNStatusBar.currentHeight ?? 0) + 10,
    },
    scrollView: {
        paddingBottom: 250,
    },
    flashListContent: {
        paddingBottom: 100,
    },
    shadow: {
        shadowColor: '#3c0366',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
});
