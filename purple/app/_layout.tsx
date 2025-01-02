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
                    InterRegular: require('../assets/fonts/InterDisplay-Regular.ttf'),
                    InterThin: require('../assets/fonts/InterDisplay-Thin.ttf'),
                    InterBlack: require('../assets/fonts/InterDisplay-Black.ttf'),
                    InterBold: require('../assets/fonts/InterDisplay-Bold.ttf'),
                    InterExtraBold: require('../assets/fonts/InterDisplay-ExtraBold.ttf'),
                    InterExtraLight: require('../assets/fonts/InterDisplay-ExtraLight.ttf'),
                    InterLight: require('../assets/fonts/InterDisplay-Light.ttf'),
                    InterMedium: require('../assets/fonts/InterDisplay-Medium.ttf'),
                    InterSemiBold: require('../assets/fonts/InterDisplay-SemiBold.ttf'),
                    GresaRegular: require('../assets/fonts/gresa/Gresa-Regular.ttf'),
                    MockupDisplay: require('../assets/fonts/Mockup-Display.ttf'),
                    WolfSansRegular: require('../assets/fonts/Wolf-Sans-Regular.ttf'),
                    MonaSansBlack: require('../assets/fonts/mona-sans/MonaSans-Black.ttf'),
                    MonaSansBold: require('../assets/fonts/mona-sans/MonaSans-Bold.ttf'),
                    MonaSansExtraBold: require('../assets/fonts/mona-sans/MonaSans-ExtraBold.ttf'),
                    MonaSansExtraLight: require('../assets/fonts/mona-sans/MonaSans-ExtraLight.ttf'),
                    MonaSansLight: require('../assets/fonts/mona-sans/MonaSans-Light.ttf'),
                    MonaSansMedium: require('../assets/fonts/mona-sans/MonaSans-Medium.ttf'),
                    MonaSansRegular: require('../assets/fonts/mona-sans/MonaSans-Regular.ttf'),
                    gramatikaMedium: require('../assets/fonts/mona-sans/MonaSans-SemiBold.ttf'),
                    GramatikaBlack: require('../assets/fonts/gramatika/GramatikaBlack.otf'),
                    GramatikaBlackItalic: require('../assets/fonts/gramatika/GramatikaBlackItalic.otf'),
                    GramatikaBold: require('../assets/fonts/gramatika/GramatikaBold.otf'),
                    GramatikaBoldItalic: require('../assets/fonts/gramatika/GramatikaBoldItalic.otf'),
                    GramatikaExtraLight: require('../assets/fonts/gramatika/GramatikaExtraLight.otf'),
                    GramatikaExtraLightItalic: require('../assets/fonts/gramatika/GramatikaExtraLightItalic.otf'),
                    GramatikaLight: require('../assets/fonts/gramatika/GramatikaLight.otf'),
                    GramatikaLightItalic: require('../assets/fonts/gramatika/GramatikaLightItalic.otf'),
                    GramatikaMedium: require('../assets/fonts/gramatika/GramatikaMedium.otf'),
                    GramatikaMediumItalic: require('../assets/fonts/gramatika/GramatikaMediumItalic.otf'),
                    GramatikaRegular: require('../assets/fonts/gramatika/GramatikaRegular.otf'),
                    GramatikaRegularItalic: require('../assets/fonts/gramatika/GramatikaRegularItalic.otf'),
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
                        <ThemeProvider value={DefaultTheme}>
                            <QueryClientProvider client={queryClient}>
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
                            </QueryClientProvider>
                        </ThemeProvider>
                    </PortalProvider>
                </BottomSheetModalProvider>
            </GestureHandlerRootView>
            <Toast config={toastConfig} />
        </>
    );
}
