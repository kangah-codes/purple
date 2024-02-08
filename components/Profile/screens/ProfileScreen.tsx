import { SafeAreaView, View, Text, ScrollView } from "@/components/styled";
import ExpoStatusBar from "expo-status-bar/build/ExpoStatusBar";
import {
	FlatList,
	StatusBar as RNStatusBar,
	RefreshControl,
} from "react-native";
import ProfileHeader from "../molecules/ProfileHeader";

export default function ProfileScreen() {
	return (
		<SafeAreaView className="bg-white">
			<ExpoStatusBar style="dark" />
			<View
				style={{
					paddingTop: RNStatusBar.currentHeight,
				}}
				className="bg-white px-5 space-y-5"
			>
				<View className="flex flex-row justify-between items-center pt-2.5">
					<View className="flex flex-col">
						<Text
							style={{ fontFamily: "Suprapower" }}
							className="text-lg"
						>
							My Profile
						</Text>
					</View>
				</View>

				<View className="mt-5">
					<ProfileHeader />
				</View>

				<ScrollView
					className="mt-5 h-full space-y-5"
					contentContainerStyle={{
						paddingBottom: 300,
					}}
					showsVerticalScrollIndicator={false}
				></ScrollView>
			</View>
		</SafeAreaView>
	);
}
