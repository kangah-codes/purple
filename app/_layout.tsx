import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";

import { useColorScheme } from "@/components/useColorScheme";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import * as Font from "expo-font";

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
	// Ensure that reloading on `/modal` keeps a back button present.
	initialRouteName: "(tabs)",
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
					Suprapower: require("../assets/fonts/Suprapower.otf"),
					InterRegular: require("../assets/fonts/Inter-Regular.ttf"),
					InterThin: require("../assets/fonts/Inter-Thin.ttf"),
					InterBlack: require("../assets/fonts/Inter-Black.ttf"),
					InterBold: require("../assets/fonts/Inter-Bold.ttf"),
					InterExtraBold: require("../assets/fonts/Inter-ExtraBold.ttf"),
					InterExtraLight: require("../assets/fonts/Inter-ExtraLight.ttf"),
					InterLight: require("../assets/fonts/Inter-Light.ttf"),
					InterMedium: require("../assets/fonts/Inter-Medium.ttf"),
					InterSemiBold: require("../assets/fonts/Inter-SemiBold.ttf"),
					SpaceMonoRegular: require("../assets/fonts/SpaceMono-Regular.ttf"),
					SpaceMonoBold: require("../assets/fonts/SpaceMono-Bold.ttf"),
					AnalogueRegular: require("../assets/fonts/analogue55regular.ttf"),
					AnalogueMedium: require("../assets/fonts/analogue65medium.ttf"),
					AnalogueBold: require("../assets/fonts/analogue75bold.ttf"),
					AnalogueBlack: require("../assets/fonts/analogue85black.ttf"),
				});

				// Artificially delay for two seconds to simulate a slow loading
				// experience. Please remove this if you copy and paste the code!
				await new Promise((resolve) => setTimeout(resolve, 1000));
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
				<ThemeProvider value={DefaultTheme}>
					<Stack
						screenOptions={{
							contentStyle: {
								backgroundColor: "#fff",
							},
						}}
					>
						<Stack.Screen
							name="(tabs)"
							options={{ headerShown: false }}
						/>
					</Stack>
				</ThemeProvider>
			</BottomSheetModalProvider>
		</GestureHandlerRootView>
	);
}
