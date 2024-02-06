import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import {
	FlatList,
	StatusBar as RNStatusBar,
	RefreshControl,
} from "react-native";
import { BellIcon, SearchIcon } from "../SVG/icons";
import { InputField, SafeAreaView, ScrollView, Text, View } from "../styled";
import AccountCardCarousel from "./AccountCardCarousel";
import SavingPlanCard from "./SavingPlanCard";
import TransactionHistoryCard from "./TransactionHistoryCard";
import { useState, useCallback } from "react";
// import { hasNotch } from "@/constants/Display";

export default function IndexScreen() {
	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		setTimeout(() => {
			setRefreshing(false);
		}, 2000);
	}, []);

	const savingData = [
		{
			category: "🏠 Mortgage",
			percentageCompleted: 30,
			name: "House Rent",
			currentAmount: 3000,
			targetAmount: 9000,
		},
		{
			category: "🛩️ Travel",
			percentageCompleted: 30,
			name: "Trip to Europe",
			currentAmount: 3000,
			targetAmount: 9000,
		},
		{
			category: "🚗 Car",
			percentageCompleted: 20,
			name: "New Car Fund",
			currentAmount: 4000,
			targetAmount: 20000,
		},
		{
			category: "💼 Retirement",
			percentageCompleted: 10,
			name: "Retirement Savings",
			currentAmount: 10000,
			targetAmount: 100000,
		},
		{
			category: "🎓 Education",
			percentageCompleted: 50,
			name: "College Tuition",
			currentAmount: 15000,
			targetAmount: 30000,
		},
		{
			category: "👰 Wedding",
			percentageCompleted: 40,
			name: "Dream Wedding",
			currentAmount: 8000,
			targetAmount: 20000,
		},
		{
			category: "🎁 Gifts",
			percentageCompleted: 70,
			name: "Christmas Gifts",
			currentAmount: 700,
			targetAmount: 1000,
		},
	];

	// console.log(hasNotch);

	return (
		<SafeAreaView>
			<ExpoStatusBar style="dark" />
			<View
				style={{
					paddingTop: RNStatusBar.currentHeight,
				}}
				className="bg-white px-5"
			>
				<View
					className="flex flex-row justify-between items-center pt-2.5 "
					style={
						{
							// paddingTop: hasNotch ? 0 : 10,
						}
					}
				>
					<View className="flex flex-col">
						<Text
							style={{ fontFamily: "Suprapower" }}
							className="text-lg"
						>
							Hi, Joshua 👋
						</Text>
					</View>

					<View className="rounded-full bg-purple-100 w-8 h-8 flex items-center justify-center relative">
						<BellIcon width={18} height={18} stroke={"#A855F7"} />

						{/** Show outstanding notifications */}
						<View className="rounded-full bg-red-500 w-1.5 h-1.5 absolute top-1.5 right-2" />
					</View>
				</View>

				<View className="mt-5">
					<View className="relative flex justify-center">
						<InputField
							className="border border-gray-200 rounded-lg p-1.5 px-5 pl-10 py-2.5 text-gray-500"
							style={{ fontFamily: "InterSemiBold" }}
							placeholder="Search"
							cursorColor={"#000"}
						/>
						<SearchIcon
							width={16}
							height={16}
							style={{ position: "absolute", left: 15 }}
							stroke="#A855F7"
						/>
					</View>
				</View>

				<ScrollView
					className="mt-5 h-full space-y-5"
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
					<View className="w-full">
						<AccountCardCarousel />
					</View>

					<View className="flex flex-col space-y-5">
						<View className="flex flex-row w-full justify-between items-center">
							<Text
								style={{ fontFamily: "InterSemiBold" }}
								className="text-base text-gray-700"
							>
								My saving plans
							</Text>

							<Text
								style={{ fontFamily: "InterBold" }}
								className="text-base"
							>
								View All
							</Text>
						</View>
						<FlatList
							horizontal
							showsHorizontalScrollIndicator={false}
							data={savingData}
							renderItem={({ item, index }) => (
								<SavingPlanCard data={item} index={index} />
							)}
							keyExtractor={(_, index) => index.toString()}
						/>
					</View>

					<View className="flex flex-col">
						<View className="flex flex-row w-full justify-between items-center">
							<Text
								style={{ fontFamily: "InterSemiBold" }}
								className="text-base text-gray-700"
							>
								Transaction History
							</Text>
						</View>
						<FlatList
							showsVerticalScrollIndicator={false}
							data={savingData}
							renderItem={({ item, index }) => (
								<TransactionHistoryCard />
							)}
							keyExtractor={(_, index) => index.toString()}
						/>
					</View>
				</ScrollView>
			</View>
		</SafeAreaView>
	);
}
