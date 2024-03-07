import { transactionData } from "@/components/Index/constants";
import { PlusIcon } from "@/components/SVG/24x24";
import {
	LinearGradient,
	SafeAreaView,
	Text,
	TouchableOpacity,
	View,
} from "@/components/Shared/styled";
import ExpoStatusBar from "expo-status-bar/build/ExpoStatusBar";
import { FlatList, StatusBar as RNStatusBar } from "react-native";
import TransactionHistoryCard from "../molecules/TransactionHistoryCard";
import { router } from "expo-router";

export default function TransactionsScreen() {
	return (
		<SafeAreaView className="bg-white relative h-full">
			<ExpoStatusBar style="dark" />
			<View
				style={{
					paddingTop: RNStatusBar.currentHeight,
				}}
				className="bg-white"
			>
				<View className="flex flex-col space-y-2.5 px-5 py-2.5">
					<View className="flex flex-row justify-between items-center">
						<View className="flex flex-col">
							<Text
								style={{ fontFamily: "Suprapower" }}
								className="text-lg"
							>
								My Transactions
							</Text>
						</View>
					</View>
				</View>

				<FlatList
					data={transactionData}
					keyExtractor={(_, index) => index.toString()}
					contentContainerStyle={{
						paddingBottom: 100,
						paddingHorizontal: 20,
					}}
					showsVerticalScrollIndicator={true}
					renderItem={({ item }) => (
						<TransactionHistoryCard
							data={item}
							onPress={() => console.log("LUL")}
						/>
					)}
					ItemSeparatorComponent={() => (
						<View className="border-b border-gray-100" />
					)}
				/>
			</View>

			<LinearGradient
				className="rounded-full  justify-center items-center space-y-4 absolute right-5 bottom-5"
				colors={["#c084fc", "#9333ea"]}
			>
				<TouchableOpacity
					className="items-center w-[55px] h-[55px] justify-center rounded-full p-3 "
					onPress={() => {
						router.push("/transactions/new-transaction");
					}}
				>
					<PlusIcon stroke={"#fff"} />
				</TouchableOpacity>
			</LinearGradient>
		</SafeAreaView>
	);
}
