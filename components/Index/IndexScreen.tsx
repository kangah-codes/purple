import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { Dimensions, StatusBar as RNStatusBar } from "react-native";
import { BellIcon, CoinSwapIcon, SearchIcon } from "../SVG/icons";
import { InputField, Text, View } from "../styled";
import Carousel from "react-native-snap-carousel";
import { formatCurrencyAccurate, formatCurrencyRounded } from "@/utils/number";

type AccountCard = {
	accountCurrency: string;
	accountBalance: number;
	accountName: string;
	cardBackgroundColour: string;
	cardTintColour: string;
};

export default function IndexScreen() {
	const data = [
		{
			accountCurrency: "GHS",
			accountBalance: 120000,
			accountName: "Fidelity Bank Account",
			cardBackgroundColour: "#F97316",
			cardTintColour: "#FED7AA",
		},
		{
			accountCurrency: "GHS",
			accountBalance: 98994329,
			accountName: "MTN MoMo",
			cardBackgroundColour: "#FACC15",
			cardTintColour: "#FEF9C3",
		},
	];

	const renderItem = (item: AccountCard) => {
		console.log(item);
		return (
			<View
				className="w-full p-5 rounded-2xl flex flex-col justify-center items-center space-y-4"
				style={{ backgroundColor: item.cardBackgroundColour }}
			>
				<Text
					style={{ fontFamily: "Suprapower" }}
					className="text-white text-base"
				>
					Available Balance
				</Text>

				<View className="flex flex-col items-center">
					<Text
						style={{ fontFamily: "Suprapower" }}
						className="text-white text-2xl"
					>
						{item.accountBalance > 9_999_999
							? formatCurrencyRounded(
									item.accountBalance,
									item.accountCurrency
							  )
							: formatCurrencyAccurate(
									item.accountCurrency,
									item.accountBalance
							  )}
					</Text>
					<Text
						style={{ fontFamily: "InterSemiBold" }}
						className="text-white text-base tracking-tighter"
					>
						{item.accountName}
					</Text>
				</View>

				<View className="h-[1px] bg-white w-full" />

				<View className="flex flex-row space-x-2 items-stretch w-full">
					<View className="flex-grow bg-white rounded-full px-2 py-1 flex items-center justify-center h-12">
						<Text
							style={{ fontFamily: "Suprapower" }}
							className="text-black text-base"
						>
							Income
						</Text>
					</View>
					<View
						className="flex-grow rounded-full px-2 py-1 flex items-center justify-center h-12"
						style={{ backgroundColor: item.cardTintColour }}
					>
						<Text
							style={{ fontFamily: "Suprapower" }}
							className="text-black text-base"
						>
							Expense
						</Text>
					</View>
					<View className="aspect-square h-12 rounded-full bg-white flex items-center justify-center">
						<CoinSwapIcon width={24} height={24} stroke="#000" />
					</View>
				</View>
			</View>
		);
	};

	return (
		<>
			<ExpoStatusBar style="dark" />
			<View
				style={{
					paddingTop: RNStatusBar.currentHeight,
				}}
				className="px-5 bg-white"
			>
				<View className="flex flex-row justify-between items-center">
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
							className="border border-gray-200 rounded-lg p-1.5 px-5 pl-10 text-gray-500"
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

				<View className="mt-5">
					{/* <View className="w-full bg-purple-500 p-5 rounded-2xl flex flex-col justify-center items-center space-y-4">
						<Text
							style={{ fontFamily: "Suprapower" }}
							className="text-white text-base"
						>
							Available Balance
						</Text>

						<View className="flex flex-col items-center">
							<Text
								style={{ fontFamily: "Suprapower" }}
								className="text-white text-2xl"
							>
								GHS 124,000.00
							</Text>
							<Text
								style={{ fontFamily: "InterSemiBold" }}
								className="text-white text-base tracking-tighter"
							>
								Fidelity Bank Account
							</Text>
						</View>

						<View className="h-[0.3px] bg-gray-100 w-full" />

						<View className="flex flex-row space-x-2 items-stretch w-full">
							<View className="flex-grow bg-white rounded-full px-2 py-1 flex items-center justify-center h-12">
								<Text
									style={{ fontFamily: "Suprapower" }}
									className="text-black text-base"
								>
									Income
								</Text>
							</View>
							<View className="flex-grow bg-purple-200 border border-purple-100 rounded-full px-2 py-1 flex items-center justify-center h-12">
								<Text
									style={{ fontFamily: "Suprapower" }}
									className="text-black text-base"
								>
									Expense
								</Text>
							</View>
							<View className="aspect-square h-12 rounded-full bg-white flex items-center justify-center">
								<CoinSwapIcon
									width={24}
									height={24}
									stroke="#000"
								/>
							</View>
						</View>
					</View> */}

					<View className="w-full">
						<Carousel
							data={data}
							renderItem={({ item }) => renderItem(item)}
							sliderWidth={Dimensions.get("window").width - 40} // Customize width as needed
							itemWidth={Dimensions.get("window").width - 40} // Customize width as needed
							layout={"default"} // 'default', 'stack', 'tinder'
							loop={true} // Set to true if you want to loop through items
							autoplay={false} // Set to true if you want automatic sliding
							style={{
								width: "100%",
							}}
						/>
					</View>
				</View>
			</View>
		</>
	);
}
