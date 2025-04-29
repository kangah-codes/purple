import { AuthProvider } from '@/components/Auth/hooks';
import LoadingScreen from '@/components/Index/molecules/LoadingScreen';
import { toastConfig } from '@/components/Shared/atoms/Toast';
import { ErrorBoundary } from '@/components/Shared/molecules/Errorboundary';
import CurrentTransactionModal from '@/components/Transactions/molecules/CurrentTransactionModal';
import { initializeApp } from '@/lib/startup';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalProvider } from '@gorhom/portal';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import 'expo-dev-client';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteDatabase, SQLiteProvider } from 'expo-sqlite';
import React, { Suspense, useCallback, useState } from 'react';
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
    const [appIsReady, setAppIsReady] = useState(true);

    const onInitialise = useCallback(async (db: SQLiteDatabase) => {
        try {
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
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        <Suspense fallback={<LoadingScreen />}>
                            <SQLiteProvider
                                databaseName='purple_test_1.db'
                                onInit={onInitialise}
                                useSuspense
                                options={{
                                    useNewConnection: true,
                                }}
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
                                                    <Stack.Screen
                                                        name='settings'
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
                </AuthProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
