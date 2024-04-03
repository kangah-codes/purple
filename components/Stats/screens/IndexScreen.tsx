import { transactionData } from "@/components/Index/constants";
import { SafeAreaView, Text, View } from "@/components/Shared/styled";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { FlatList, StatusBar as RNStatusBar } from "react-native";
import StatsHeatmap from "../molecules/Heatmap";
import TransactionBreakdownCard from "../molecules/TransactionBreakdownCard";
import TransactionsPieChart from "../molecules/TransactionsPieChart";

export default function AccountsScreen() {
	return (
		<SafeAreaView className="relative h-full bg-white">
			<ExpoStatusBar style="dark" />
			<View
				style={{
					paddingTop: RNStatusBar.currentHeight,
				}}
				className="bg-white px-5"
			>
				<View className="flex flex-row items-center justify-between py-2.5">
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

				<FlatList
					contentContainerStyle={{ paddingBottom: 100 }}
					showsVerticalScrollIndicator={false}
					data={transactionData}
					renderItem={({ item }) => (
						<TransactionBreakdownCard
							data={item}
							onPress={() => console.log("LUL")}
						/>
					)}
					ItemSeparatorComponent={() => (
						<View className="border-b border-gray-100" />
					)}
					keyExtractor={(_, index) => index.toString()}
					ListHeaderComponent={() => (
						<View className="flex flex-col space-y-5">
							<View className="flex flex-col space-y-2.5">
								<Text
									className="text-sm text-black"
									style={{ fontFamily: "Suprapower" }}
								>
									Daily Activity
								</Text>

								<StatsHeatmap />
							</View>

							<View className="flex flex-col space-y-2.5">
								<Text
									className="text-sm text-black"
									style={{ fontFamily: "Suprapower" }}
								>
									Spend Overview
								</Text>
								<View className="flex flex-col space-y-5">
									<View className="h-[200] flex-1 rounded-xl border border-gray-200">
										<TransactionsPieChart />
									</View>
								</View>
							</View>

							<View className="flex flex-row justify-between space-x-5">
								<View className="flex w-[64%] flex-col space-y-2.5 rounded-xl border border-gray-200 p-5">
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
											className="text-xs tracking-tighter text-gray-400"
										>
											/ GHS 2,000.00
										</Text>
									</View>

									<View className="rounded-lg bg-gray-100 p-2">
										<View className="flex flex-row justify-between">
											<View className="h-5 w-10 rounded-md bg-purple-600" />

											{new Array(30)
												.fill(0)
												.map((_, i) => (
													<View
														className="h-5 w-[1.3] bg-gray-400"
														key={i}
													/>
												))}
										</View>
									</View>
								</View>
								<View className="flex w-[30%] flex-col space-y-5 rounded-xl border-gray-200">
									<View className="w-full flex-1 items-center justify-center overflow-hidden rounded-xl border border-gray-200">
										<Text
											style={{ fontFamily: "Suprapower" }}
											className="text-xl text-purple-700"
										>
											100%
										</Text>
									</View>

									<View className="w-full flex-1 items-center justify-center overflow-hidden rounded-xl border border-gray-200">
										<Text
											style={{ fontFamily: "Suprapower" }}
											className="text-xl text-purple-700"
										>
											100%
										</Text>
									</View>
								</View>
							</View>
							<View style={{ marginTop: 20 }} />
						</View>
					)}
				/>
			</View>
		</SafeAreaView>
	);
}
