import {
	InputField,
	SafeAreaView,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "@/components/Shared/styled";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { RefreshControl, StatusBar as RNStatusBar } from "react-native";
import AccountsTotalSummary from "../molecules/AccountsTotalSummary";
import { DotsVerticalIcon } from "@/components/SVG/20x20";
import AccountsAccordion from "../molecules/AccountsAccordion";

export default function AccountsScreen() {
	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		setTimeout(() => {
			setRefreshing(false);
		}, 2000);
	}, []);

	return (
		<SafeAreaView className="bg-white">
			<ExpoStatusBar style="dark" />
			<View
				style={{
					paddingTop: RNStatusBar.currentHeight,
				}}
				className="bg-white"
			>
				<View className="px-5 flex flex-col space-y-2.5">
					<View className="flex flex-row justify-between items-center">
						<Text
							style={{ fontFamily: "Suprapower" }}
							className="text-lg"
						>
							Accounts
						</Text>

						<TouchableOpacity onPress={alert}>
							<DotsVerticalIcon stroke={"#9CA3AF"} />
						</TouchableOpacity>
					</View>

					<View className="h-1 border-gray-100 border-b w-full" />

					<View className="mb-5">
						<AccountsTotalSummary />
					</View>
				</View>

				<ScrollView
					className="h-full space-y-5"
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
					<AccountsAccordion />
				</ScrollView>
			</View>
		</SafeAreaView>
	);
}
