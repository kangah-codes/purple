import { AuthProvider } from '@/components/Auth/hooks';
import LoadingScreen from '@/components/Index/molecules/LoadingScreen';
import { toastConfig } from '@/components/Shared/atoms/Toast';
import ConfirmationModal from '@/components/Shared/molecules/ConfirmationModal';
import { ErrorBoundary } from '@/components/Shared/molecules/Errorboundary';
import AppQueryClientProvider from '@/components/Shared/molecules/QueryClientProvider';
import CurrentRecurringTransactionModal from '@/components/Transactions/molecules/CurrentRecurringTransactionModal';
import CurrentTransactionModal from '@/components/Transactions/molecules/CurrentTransactionModal';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { AnalyticsProvider } from '@/lib/providers/Analytics';
import { initializeApp } from '@/lib/startup';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalProvider } from '@gorhom/portal';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import 'expo-dev-client';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteDatabase, SQLiteProvider } from 'expo-sqlite';
import React, { Suspense, useCallback, useState } from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Updates from 'expo-updates';

function AppWithNotifications() {
    useNotifications();
    return (
        <AnalyticsProvider
            config={{
                enableDebugLogs: true,
                syncEveryMs: 180000,
                batchSize: 25,
            }}
            disabled
            autoFlushOnBackground={true}
        >
            <BottomSheetModalProvider>
                <PortalProvider>
                    <SafeAreaProvider>
                        <ThemeProvider value={DefaultTheme}>
                            {/** Portal Rendering  */}
                            <CurrentTransactionModal modalKey='transactionReceipt' />
                            <CurrentRecurringTransactionModal modalKey='recurringTransactionReceipt' />
                            <ConfirmationModal />
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
                                <Stack.Screen name='accounts' options={{ headerShown: false }} />
                                <Stack.Screen
                                    name='transactions'
                                    options={{ headerShown: false }}
                                />
                                <Stack.Screen name='onboarding' options={{ headerShown: false }} />
                                <Stack.Screen name='auth' options={{ headerShown: false }} />
                                <Stack.Screen name='settings' options={{ headerShown: false }} />
                            </Stack>
                        </ThemeProvider>
                    </SafeAreaProvider>
                </PortalProvider>
            </BottomSheetModalProvider>
        </AnalyticsProvider>
    );
}

Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,

    // Adds more context data to events (IP address, cookies, user, etc.)
    // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
    sendDefaultPii: true,

    // Configure Session Replay
    // replaysSessionSampleRate: 0,
    // replaysOnErrorSampleRate: 0,
    integrations: [],

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
    enabled: !__DEV__,
});

export const unstable_settings = {
    initialRouteName: '(tabs)/index',
};

SplashScreen.preventAutoHideAsync();
LogBox.ignoreAllLogs(true);

// disable error logging in development
if (__DEV__) {
    console.error = () => {};
    console.warn = () => {};
}

export default Sentry.wrap(function RootLayout() {
    const [appIsReady, setAppIsReady] = useState(true);
    const onInitialise = useCallback(async (db: SQLiteDatabase) => {
        try {
            if (!__DEV__) {
                try {
                    const update = await Updates.checkForUpdateAsync();

                    if (update.isAvailable) {
                        try {
                            const fetchResult = await Updates.fetchUpdateAsync();

                            if (fetchResult && 'isNew' in fetchResult && fetchResult.isNew) {
                                await new Promise((resolve) => setTimeout(resolve, 1000));
                                await Updates.reloadAsync();
                                return;
                            } else {
                                await Updates.reloadAsync();
                                return;
                            }
                        } catch (fetchError) {
                            const errorMessage =
                                fetchError instanceof Error
                                    ? fetchError.message
                                    : 'Download failed';

                            Sentry.captureException(fetchError, {
                                tags: { component: 'update_fetch' },
                                extra: {
                                    updateInfo: update,
                                    errorDetails: {
                                        message: errorMessage,
                                        stack:
                                            fetchError instanceof Error
                                                ? fetchError.stack
                                                : undefined,
                                    },
                                },
                            });
                        }
                    }
                } catch (updateError) {
                    const errorMessage =
                        updateError instanceof Error ? updateError.message : 'Unknown error';
                    Sentry.captureException(updateError, {
                        tags: { component: 'update_check' },
                        extra: {
                            errorDetails: {
                                message: errorMessage,
                                stack: updateError instanceof Error ? updateError.stack : undefined,
                            },
                        },
                    });
                }
            }

            await initializeApp(db);
        } catch (e) {
            console.error('Error during app initialization:', e);
        } finally {
            setAppIsReady(true);
            await SplashScreen.hideAsync();
        }
    }, []);

    if (!appIsReady) {
        return null;
    }

    return (
        <ErrorBoundary>
            <AppQueryClientProvider>
                <AuthProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        <Suspense fallback={<LoadingScreen />}>
                            <SQLiteProvider
                                databaseName='purple.db'
                                onInit={onInitialise}
                                useSuspense
                                // options={{
                                //     useNewConnection: true,
                                // }}
                            >
                                <AppWithNotifications />
                            </SQLiteProvider>
                        </Suspense>
                    </GestureHandlerRootView>
                    <Toast config={toastConfig} />
                </AuthProvider>
            </AppQueryClientProvider>
        </ErrorBoundary>
    );
});
