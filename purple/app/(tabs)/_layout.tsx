import { Redirect, Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuth } from '@/components/Auth/hooks';
import {
    BarLineChartIcon,
    CoinSwapIcon,
    HomeSmileIcon,
    PiggyBankIcon,
    SafeIcon,
    UserCircleIcon,
} from '@/components/SVG/icons/noscale';
import Colors from '@/lib/constants/Colors';
import { SettingsCogIcon } from '@/components/SVG/icons/24x24';
import { Text, View } from '@/components/Shared/styled';
import { satoshiFont } from '@/lib/constants/fonts';
import * as NavigationBar from 'expo-navigation-bar';

export default function TabLayout() {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Redirect href='/onboarding/landing' />;
    }

    useEffect(() => {
        // make nav bar transparent like ios
        NavigationBar.setPositionAsync('absolute');
        NavigationBar.setBackgroundColorAsync('transparent');
    }, []);

    return (
        <Tabs
            initialRouteName='index'
            screenOptions={{
                tabBarActiveTintColor: Colors['light'].tint,
                tabBarShowLabel: false, // Hide default labels since we're using custom ones
                tabBarStyle: [
                    {
                        backgroundColor: '#F9F9F9',
                        height: 80,
                    },
                ],
            }}
        >
            <Tabs.Screen
                name='index'
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <View className='flex flex-col items-center justify-center'>
                            <HomeSmileIcon width={24} height={24} stroke={color} />
                            <Text className='text-xs' style={[satoshiFont.satoshiBold, { color }]}>
                                Home
                            </Text>
                        </View>
                    ),
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name='plans'
                options={{
                    title: 'Plans',
                    tabBarIcon: ({ color }) => (
                        <View className='flex flex-col items-center justify-center'>
                            <PiggyBankIcon width={24} height={24} stroke={color} />
                            <Text className='text-xs' style={[satoshiFont.satoshiBold, { color }]}>
                                Budgets
                            </Text>
                        </View>
                    ),
                    headerShown: false,
                    // TODO: hiding this for now
                    href: null,
                }}
            />
            <Tabs.Screen
                name='transactions'
                options={{
                    title: 'Transactions',
                    tabBarIcon: ({ color }) => (
                        <View className='flex flex-col items-center justify-center'>
                            <CoinSwapIcon width={24} height={24} stroke={color} />
                            <Text className='text-xs' style={[satoshiFont.satoshiBold, { color }]}>
                                Transactions
                            </Text>
                        </View>
                    ),
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name='stats'
                options={{
                    title: 'Stats',
                    tabBarIcon: ({ color }) => (
                        <View className='flex flex-col items-center justify-center'>
                            <BarLineChartIcon width={24} height={24} stroke={color} />
                            <Text className='text-xs' style={[satoshiFont.satoshiBold, { color }]}>
                                Reports
                            </Text>
                        </View>
                    ),
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name='accounts'
                options={{
                    title: 'Accounts',
                    tabBarIcon: ({ color }) => (
                        <View className='flex flex-col items-center justify-center'>
                            <SafeIcon width={24} height={24} stroke={color} />
                            <Text className='text-xs' style={[satoshiFont.satoshiBold, { color }]}>
                                Accounts
                            </Text>
                        </View>
                    ),
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name='settings'
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => (
                        <View className='flex flex-col items-center justify-center'>
                            <SettingsCogIcon width={24} height={24} stroke={color} />
                            <Text className='text-xs' style={[satoshiFont.satoshiBold, { color }]}>
                                Settings
                            </Text>
                        </View>
                    ),
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name='profile'
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => (
                        <View className='flex flex-col items-center justify-center'>
                            <UserCircleIcon width={24} height={24} stroke={color} />
                            <Text className='text-xs' style={satoshiFont.satoshiBold}>
                                Profile
                            </Text>
                        </View>
                    ),
                    headerShown: false,
                    href: null,
                }}
            />
        </Tabs>
    );
}
