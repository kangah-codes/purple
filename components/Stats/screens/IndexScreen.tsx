import {
	InputField,
	LinearGradient,
	SafeAreaView,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "@/components/Shared/styled";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { RefreshControl, StatusBar as RNStatusBar } from "react-native";
import { DotsVerticalIcon } from "@/components/SVG/20x20";
import { router } from "expo-router";
import { EditSquareIcon, PlusIcon } from "@/components/SVG/24x24";
import StatsHeatmap from "../molecules/Heatmap";

export default function AccountsScreen() {
	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		setTimeout(() => {
			setRefreshing(false);
		}, 2000);
	}, []);

	return (
		<SafeAreaView className="bg-white relative h-full">
			<ExpoStatusBar style="dark" />
			<View
				style={{
					paddingTop: RNStatusBar.currentHeight,
				}}
				className="bg-white px-5"
			>
				<View className="flex flex-col space-y-2.5">
					<View className="flex flex-row justify-between items-center pt-2.5">
						<Text
							style={{ fontFamily: "Suprapower" }}
							className="text-lg"
						>
							Stats
						</Text>

						{/* <TouchableOpacity onPress={alert}>
							<DotsVerticalIcon stroke={"#9CA3AF"} />
						</TouchableOpacity> */}
					</View>
				</View>

				<ScrollView
					className="h-full space-y-5 mt-5 flex flex-col"
					contentContainerStyle={{
						paddingBottom: 300,
					}}
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
						/>
					}
				>
					<View className="flex flex-col space-y-2.5">
						<Text
							className="text-lg text-blackß"
							style={{ fontFamily: "Suprapower" }}
						>
							Weekly Something
						</Text>
						<StatsHeatmap />
					</View>

					<View className="flex flex-col space-y-2.5">
						<Text
							className="text-lg text-blackß"
							style={{ fontFamily: "Suprapower" }}
						>
							Accounts Overview
						</Text>
						<View className="flex flex-row justify-between">
							<View className="flex-1 border-gray-200 rounded-xl p-1.5 px-5 border py-2.5 h-[240] mr-2.5"></View>
							<View className="flex-1 border-gray-200 rounded-xl p-1.5 px-5 border py-2.5 h-[240] ml-2.5"></View>
						</View>
					</View>
				</ScrollView>
			</View>
		</SafeAreaView>
	);
}
