import {
	LinearGradient,
	SafeAreaView,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "@/components/styled";
import ExpoStatusBar from "expo-status-bar/build/ExpoStatusBar";
import { StatusBar as RNStatusBar } from "react-native";
import ExpensesCard from "../molecules/ExpensesCard";
import { EditSquareIcon } from "@/components/SVG/24x24";

export default function PlansScreen() {
	return (
		<SafeAreaView className="bg-white relative">
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
							My Plans
						</Text>
					</View>
				</View>

				{/** Will have to replace this component */}
				<View className="w-full bg-purple-100 rounded-full p-1.5 flex flex-row space-x-1.5">
					<View className="bg-white px-5 py-2.5 flex-grow flex items-center justify-center rounded-full">
						<Text
							style={{ fontFamily: "Suprapower" }}
							className="text-base"
						>
							Expenses
						</Text>
					</View>

					<View className="bg-purple-100 px-5 py-2.5 flex-grow flex items-center justify-center rounded-full">
						<Text
							style={{ fontFamily: "Suprapower" }}
							className="text-base"
						>
							Savings
						</Text>
					</View>
				</View>

				<ScrollView
					className="mt-5 flex h-full flex-col space-y-5"
					contentContainerStyle={{
						paddingBottom: 300,
					}}
					showsVerticalScrollIndicator={false}
				>
					<View className="">
						<ExpensesCard />
					</View>
				</ScrollView>
			</View>
			<LinearGradient
				className="rounded-full  justify-center items-center space-y-4 absolute right-5 bottom-[150]"
				colors={["#c084fc", "#9333ea"]}
			>
				<TouchableOpacity
					className="items-center w-[55px] h-[55px] justify-center rounded-full p-3 "
					onPress={() => {
						// Handle your button tap here
						alert("Button tapped");
					}}
				>
					<EditSquareIcon stroke={"#fff"} />
				</TouchableOpacity>
			</LinearGradient>
		</SafeAreaView>
	);
}
