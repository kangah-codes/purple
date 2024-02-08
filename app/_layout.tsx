import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { useColorScheme } from "@/components/useColorScheme";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

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
	const [loaded, error] = useFonts({
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
		...FontAwesome.font,
	});

	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	useEffect(() => {
		if (error) throw error;
	}, [error]);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return <RootLayoutNav />;
}

function RootLayoutNav() {
	const colorScheme = useColorScheme();

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
