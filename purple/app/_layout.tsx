import 'expo-dev-client';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo, useState } from 'react';
import { AuthProvider, useAuth } from '@/components/Auth/hooks';
import { toastConfig } from '@/components/Shared/atoms/Toast';
import { ErrorBoundary } from '@/components/Shared/molecules/Errorboundary';
import { useColorScheme } from '@/components/useColorScheme';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalHost, PortalProvider } from '@gorhom/portal';
import * as Font from 'expo-font';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { QueryClient, QueryClientProvider } from 'react-query';
import CurrentTransactionModal from '@/components/Transactions/molecules/CurrentTransactionModal';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const unstable_settings = {
    initialRouteName: '(tabs)/index',
};
const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // Pre-load fonts, make any API calls you need to do here
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
                // Tell the application to render
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
    const colorScheme = useColorScheme();
    const { isLoading } = useAuth();

    // portals
    const { transactionPortal } = useMemo(
        () => ({
            transactionPortal: <PortalHost name='transactionReceipt' />,
        }),
        [],
    );

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
                                    <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
                                    <Stack.Screen name='plans' options={{ headerShown: false }} />
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
                                    <Stack.Screen name='auth' options={{ headerShown: false }} />
                                </Stack>
                            </ThemeProvider>
                        </SafeAreaProvider>
                    </PortalProvider>
                </BottomSheetModalProvider>
            </GestureHandlerRootView>
            <Toast config={toastConfig} />
        </>
    );
}
