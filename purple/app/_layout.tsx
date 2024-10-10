import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/components/Auth/hooks';
import { toastConfig } from '@/components/Shared/atoms/Toast';
import { ErrorBoundary } from '@/components/Shared/molecules/Errorboundary';
import { useColorScheme } from '@/components/useColorScheme';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalProvider } from '@gorhom/portal';
import * as Font from 'expo-font';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { QueryClient, QueryClientProvider } from 'react-query';

export const unstable_settings = {
    initialRouteName: 'onboarding/steps',
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
                    Suprapower: require('../assets/fonts/Suprapower.otf'),
                    InterRegular: require('../assets/fonts/InterDisplay-Regular.woff2'),
                    InterThin: require('../assets/fonts/InterDisplay-Thin.woff2'),
                    InterBlack: require('../assets/fonts/InterDisplay-Black.woff2'),
                    InterBold: require('../assets/fonts/InterDisplay-Bold.woff2'),
                    InterExtraBold: require('../assets/fonts/InterDisplay-ExtraBold.woff2'),
                    InterExtraLight: require('../assets/fonts/InterDisplay-ExtraLight.woff2'),
                    InterLight: require('../assets/fonts/InterDisplay-Light.woff2'),
                    InterMedium: require('../assets/fonts/InterDisplay-Medium.woff2'),
                    InterSemiBold: require('../assets/fonts/InterDisplay-SemiBold.woff2'),
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
            <AuthProvider>
                <RootLayoutNav />
            </AuthProvider>
        </ErrorBoundary>
    );
}

function RootLayoutNav() {
    const colorScheme = useColorScheme();
    const { isLoading } = useAuth();

    if (isLoading) return null;

    useEffect(() => {
        async function hideSplashScreen() {
            await SplashScreen.hideAsync();
        }

        hideSplashScreen();
    }, []);

    return (
        <>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <BottomSheetModalProvider>
                    <PortalProvider>
                        <ThemeProvider value={DefaultTheme}>
                            <QueryClientProvider client={queryClient}>
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
                            </QueryClientProvider>
                        </ThemeProvider>
                    </PortalProvider>
                </BottomSheetModalProvider>
            </GestureHandlerRootView>
            <Toast config={toastConfig} />
        </>
    );
}
