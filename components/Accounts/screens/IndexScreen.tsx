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
import AccountsTotalSummary from "../molecules/AccountsTotalSummary";
import { DotsVerticalIcon } from "@/components/SVG/20x20";
import AccountsAccordion from "../molecules/AccountsAccordion";
import { router } from "expo-router";
import { EditSquareIcon, PlusIcon } from "@/components/SVG/24x24";

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
				className="bg-white"
			>
				<View className="px-5 flex flex-col space-y-2.5">
					<View className="flex flex-row justify-between items-center pt-2.5">
						<Text
							style={{ fontFamily: "Suprapower" }}
							className="text-lg"
						>
							Accounts
						</Text>

						{/* <TouchableOpacity onPress={alert}>
							<DotsVerticalIcon stroke={"#9CA3AF"} />
						</TouchableOpacity> */}
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

			<LinearGradient
				className="rounded-full justify-center items-center space-y-4 absolute right-5 bottom-5"
				colors={["#c084fc", "#9333ea"]}
			>
				<TouchableOpacity
					className="items-center w-[55px] h-[55px] justify-center rounded-full p-3 "
					onPress={() => {
						// Handle your button tap here
						router.push("/accounts/new-acount");
					}}
				>
					<PlusIcon stroke={"#fff"} />
				</TouchableOpacity>
			</LinearGradient>
		</SafeAreaView>
	);
}
