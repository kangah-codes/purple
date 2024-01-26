import { InterText, SafeAreaView } from "../styled";
import { StatusBar as RNStatusBar } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

export default function IndexScreen() {
	return (
		<>
			<ExpoStatusBar style="dark" />
			<SafeAreaView
				style={{
					paddingTop: RNStatusBar.currentHeight,
				}}
				className="px-10"
			>
				<InterText>Hello World</InterText>
			</SafeAreaView>
		</>
	);
}
