import { AuthProvider, useAuth } from '@/components/Auth/hooks';
import LoadingScreen from '@/components/Plans/molecules/LoadingScreen';
import { toastConfig } from '@/components/Shared/atoms/Toast';
import { ErrorBoundary } from '@/components/Shared/molecules/Errorboundary';
import CurrentTransactionModal from '@/components/Transactions/molecules/CurrentTransactionModal';
import { migrateDbIfNeeded } from '@/lib/utils/database';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalProvider } from '@gorhom/portal';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import 'expo-dev-client';
import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import React, { Suspense, useEffect, useState } from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { QueryClient, QueryClientProvider } from 'react-query';

export const unstable_settings = {
    initialRouteName: '(tabs)/index',
};
const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
});

SplashScreen.preventAutoHideAsync();
LogBox.ignoreAllLogs(true);

export default function RootLayout() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                await Font.loadAsync({
                    SatoshiBlack: require('../assets/fonts/satoshi/Satoshi-Black.otf'),
                    SatoshiBlackItalic: require('../assets/fonts/satoshi/Satoshi-BlackItalic.otf'),
                    SatoshiBold: require('../assets/fonts/satoshi/Satoshi-Bold.otf'),
                    SatoshiBoldItalic: require('../assets/fonts/satoshi/Satoshi-BoldItalic.otf'),
                    SatoshiItalic: require('../assets/fonts/satoshi/Satoshi-Italic.otf'),
                    SatoshiLight: require('../assets/fonts/satoshi/Satoshi-Light.otf'),
                    SatoshiLightItalic: require('../assets/fonts/satoshi/Satoshi-LightItalic.otf'),
                    SatoshiMedium: require('../assets/fonts/satoshi/Satoshi-Medium.otf'),
                    SatoshiMediumItalic: require('../assets/fonts/satoshi/Satoshi-MediumItalic.otf'),
                    SatoshiRegular: require('../assets/fonts/satoshi/Satoshi-Regular.otf'),
                });
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }

        prepare();
    }, []);

    if (!appIsReady) {
        return null;
    }

    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <RootLayoutNav />
                </AuthProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}

function RootLayoutNav() {
    const { isLoading } = useAuth();

    useEffect(() => {
        async function hideSplashScreen() {
            await SplashScreen.hideAsync();
        }

        hideSplashScreen();
    }, []);

    if (isLoading) return null;

    return (
        <>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Suspense fallback={<LoadingScreen />}>
                    <SQLiteProvider
                        databaseName='purple_test_1.db'
                        onInit={migrateDbIfNeeded}
                        useSuspense
                    >
                        <BottomSheetModalProvider>
                            <PortalProvider>
                                <SafeAreaProvider>
                                    <ThemeProvider value={DefaultTheme}>
                                        {/** Portal Rendering  */}
                                        {/* {transactionPortal} */}
                                        <CurrentTransactionModal modalKey='transactionReceipt' />

                                        {/** Main Navigation Stack */}
                                        <Stack
                                            screenOptions={{
                                                contentStyle: {
                                                    backgroundColor: '#fff',
                                                },
                                            }}
                                        >
                                            <Stack.Screen
                                                name='(tabs)'
                                                options={{ headerShown: false }}
                                            />
                                            <Stack.Screen
                                                name='plans'
                                                options={{ headerShown: false }}
                                            />
                                            <Stack.Screen
                                                name='accounts'
                                                options={{ headerShown: false }}
                                            />
                                            <Stack.Screen
                                                name='transactions'
                                                options={{ headerShown: false }}
                                            />
                                            <Stack.Screen
                                                name='onboarding'
                                                options={{ headerShown: false }}
                                            />
                                            <Stack.Screen
                                                name='auth'
                                                options={{ headerShown: false }}
                                            />
                                        </Stack>
                                    </ThemeProvider>
                                </SafeAreaProvider>
                            </PortalProvider>
                        </BottomSheetModalProvider>
                    </SQLiteProvider>
                </Suspense>
            </GestureHandlerRootView>
            <Toast config={toastConfig} />
        </>
    );
}
