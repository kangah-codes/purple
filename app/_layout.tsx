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

export const unstable_settings = {
    initialRouteName: '(tabs)',
};

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
                    SpaceMonoRegular: require('../assets/fonts/SpaceMono-Regular.ttf'),
                    SpaceMonoBold: require('../assets/fonts/SpaceMono-Bold.ttf'),
                    AnalogueRegular: require('../assets/fonts/analogue55regular.ttf'),
                    AnalogueMedium: require('../assets/fonts/analogue65medium.ttf'),
                    AnalogueBold: require('../assets/fonts/analogue75bold.ttf'),
                    AnalogueBlack: require('../assets/fonts/analogue85black.ttf'),
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

    return <RootLayoutNav />;
}

function RootLayoutNav() {
    const colorScheme = useColorScheme();

    useEffect(() => {
        async function hideSplashScreen() {
            await SplashScreen.hideAsync();
        }

        hideSplashScreen();
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
                <PortalProvider>
                    <ThemeProvider value={DefaultTheme}>
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
                            <Stack.Screen name='transactions' options={{ headerShown: false }} />
                            <Stack.Screen name='onboarding' options={{ headerShown: false }} />
                            <Stack.Screen name='auth' options={{ headerShown: false }} />
                        </Stack>
                    </ThemeProvider>
                </PortalProvider>
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    );
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
    return (
        <View style={{ flex: 1, backgroundColor: 'red' }}>
            <Text>{props.error.message}</Text>
            <Text onPress={props.retry}>Try Again?</Text>
        </View>
    );
}
