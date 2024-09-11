import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { ErrorBoundaryProps, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import { useColorScheme } from '@/components/useColorScheme';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalProvider } from '@gorhom/portal';
import * as Font from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, View } from '@/components/Shared/styled';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/components/Shared/atoms/Toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider, useAuth } from '@/components/Auth/hooks';
import { ErrorBoundary } from '@/components/Shared/molecules/Errorboundary';

export const unstable_settings = {
    initialRouteName: 'onboarding/steps',
};
const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 2 } },
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
                    InterRegular: require('../assets/fonts/Inter-Regular.ttf'),
                    InterThin: require('../assets/fonts/Inter-Thin.ttf'),
                    InterBlack: require('../assets/fonts/Inter-Black.ttf'),
                    InterBold: require('../assets/fonts/Inter-Bold.ttf'),
                    InterExtraBold: require('../assets/fonts/Inter-ExtraBold.ttf'),
                    InterExtraLight: require('../assets/fonts/Inter-ExtraLight.ttf'),
                    InterLight: require('../assets/fonts/Inter-Light.ttf'),
                    InterMedium: require('../assets/fonts/Inter-Medium.ttf'),
                    InterSemiBold: require('../assets/fonts/Inter-SemiBold.ttf'),
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
