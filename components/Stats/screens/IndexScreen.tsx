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
import LinearGradientChart from "../molecules/LinearGradientChart";
import TransactionsPieChart from "../molecules/TransactionsPieChart";
import SavingsAreaChart from "../molecules/SavingsAreaChart";
import CategoriesBarChart from "../molecules/CategoriesBarChart";

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
							Daily Activity
						</Text>

						<StatsHeatmap />
					</View>

					<View className="flex flex-col space-y-2.5">
						<Text
							className="text-lg text-blackß"
							style={{ fontFamily: "Suprapower" }}
						>
							Spend Overview
						</Text>
						<View className="flex flex-col space-y-5">
							{/* <View className="flex-1 border-gray-200 rounded-xl border">
								<LinearGradientChart />
							</View> */}
							<View className="flex-1 border-gray-200 rounded-xl border">
								<TransactionsPieChart />
							</View>
						</View>
					</View>

					<View className="flex flex-row space-x-5 justify-between">
						<View className="w-[64%] border-gray-200 rounded-xl border p-5 flex flex-col space-y-2.5">
							<View className="flex flex-row">
								<Text
									style={{ fontFamily: "Suprapower" }}
									className=""
								>
									Savings this month
								</Text>
							</View>

							<View className="flex flex-col">
								<Text
									style={{ fontFamily: "Suprapower" }}
									className="text-xl text-purple-700"
								>
									GHS 1,000.00
								</Text>
								<Text
									style={{ fontFamily: "Suprapower" }}
									className="text-xs text-gray-400 tracking-tighter"
								>
									/ GHS 2,000.00
								</Text>
							</View>

							<View className="p-2 bg-gray-100 rounded-lg">
								<View className="flex flex-row justify-between">
									<View className="w-10 h-5 bg-purple-600 rounded-md" />

									{new Array(30).fill(0).map((_, i) => (
										<View
											className="h-5 bg-gray-400 w-[1.3]"
											key={i}
										/>
									))}
								</View>
							</View>
						</View>
						<View className="w-[30%] border-gray-200 rounded-xl flex flex-col space-y-5">
							<View className="w-full border-gray-200 rounded-xl border overflow-hidden flex-1 items-center justify-center">
								<Text
									style={{ fontFamily: "Suprapower" }}
									className="text-xl text-purple-700"
								>
									100%
								</Text>
							</View>

							<View className="w-full border-gray-200 rounded-xl border overflow-hidden flex-1 items-center justify-center">
								<Text
									style={{ fontFamily: "Suprapower" }}
									className="text-xl text-purple-700"
								>
									100%
								</Text>
							</View>
						</View>
					</View>

					<View className="flex p-5 border-gray-200 rounded-xl border">
						<CategoriesBarChart />
					</View>
				</ScrollView>
			</View>
		</SafeAreaView>
	);
}
