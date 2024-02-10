import ArrowCircleDownIcon from "@/components/SVG/28x28";
import {
	BottomSheetBackdrop,
	BottomSheetBackdropProps,
	BottomSheetModal as TBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useCallback, useMemo, useRef } from "react";
import { BottomSheetModal, LinearGradient, Text, View } from "../../styled";
import { transactionData } from "../constants";
import TransactionHistoryCard from "./TransactionHistoryCard";
import App from "./Zig";
import Svg, { Polygon } from "react-native-svg";
import {
	ArrowNarrowDownRightIcon,
	ArrowNarrowUpRightIcon,
} from "@/components/SVG/icons";
import { Platform } from "react-native";

export default function TransactionHistoryList() {
	// ref
	const bottomSheetModalRef = useRef<TBottomSheetModal>(null);

	// variables
	const snapPoints = useMemo(() => ["65%"], []);

	// callbacks
	const handlePresentModalPress = useCallback(() => {
		bottomSheetModalRef.current?.present();
	}, []);

	const renderZigZagView = useCallback(() => {
		let nodes = [];
		const numberOfTeeth = 60; // Increase the number of teeth

		for (let i = 0; i < numberOfTeeth; i++) {
			const point = `${10 * i},0 ${10 * i + 5},10 ${10 * (i + 1)},0`; // Adjust the spacing between teeth
			nodes.push(<Polygon key={i} points={point} strokeWidth="2" />);
		}
		return nodes;
	}, []);

	const handleSheetChanges = useCallback((index: number) => {
		console.log("handleSheetChanges", index);
	}, []);

	const renderBackdrop = useCallback(
		(props: BottomSheetBackdropProps) => (
			<BottomSheetBackdrop
				{...props}
				appearsOnIndex={0}
				disappearsOnIndex={-1}
			/>
		),
		[]
	);

	return (
		<View className="mt-5">
			<BottomSheetModal
				ref={bottomSheetModalRef}
				index={0}
				snapPoints={snapPoints}
				onChange={handleSheetChanges}
				enableOverDrag
				backdropComponent={renderBackdrop}
				style={{
					backgroundColor: "white",
					borderRadius: 24,
					shadowColor: "#000000",
					shadowOffset: {
						width: 0,
						height: 8,
					},
					shadowOpacity: 0.25,
					shadowRadius: 48,
					elevation: 10,
				}}
				handleIndicatorStyle={{
					backgroundColor: "#D4D4D4",
				}}
			>
				<View className="px-5">
					<View className="w-full flex flex-col space-y-5 items-center shadow-2xl">
						<View className="w-full flex flex-col space-y-0.5 items-center justify-center">
							<Text
								style={{ fontFamily: "Suprapower" }}
								className="text-lg text-gray-700"
							>
								Receipt
							</Text>
						</View>

						<View className="w-full flex flex-col">
							<Svg
								height={12}
								width={"100%"}
								style={{ transform: [{ rotate: "180deg" }] }}
								fill="#c084fc"
								stroke="#c084fc"
							>
								{renderZigZagView()}
							</Svg>
							<LinearGradient
								className="w-full py-5 flex items-center justify-center"
								colors={["#c084fc", "#9333ea"]}
							>
								<View className="flex flex-col items-center space-y-1.5">
									<View className="p-5 bg-red-100 rounded-full relative flex items-center justify-center">
										<ArrowNarrowUpRightIcon
											width={16}
											height={16}
											style={{ position: "absolute" }}
											stroke={"#B91C1C"}
										/>
									</View>
									<Text
										style={{ fontFamily: "Suprapower" }}
										className="text-lg text-white"
									>
										🏠 Rent
									</Text>
								</View>
							</LinearGradient>
							{/** Shadows don't seem to be working on Android, so just make the bg gray to make it stand out from the white bg */}
							<View
								className="w-full p-5 flex flex-col items-center space-y-5"
								style={{
									backgroundColor:
										Platform.OS === "android"
											? "#F3F4F6"
											: "white",
								}}
							>
								<Text
									style={{ fontFamily: "Suprapower" }}
									className="text-3xl text-black"
								>
									$69.42
								</Text>

								<View className="border-b border-gray-200 w-full" />

								<View className="w-full flex flex-col justify-between">
									<Text
										style={{ fontFamily: "Suprapower" }}
										className="text-sm text-gray-600"
									>
										Category
									</Text>
									<Text
										style={{ fontFamily: "InterSemiBold" }}
										className="text-sm text-black tracking-tighter"
									>
										🏠 Rent
									</Text>
								</View>

								<View className="w-full flex flex-col justify-between">
									<Text
										style={{ fontFamily: "Suprapower" }}
										className="text-sm text-gray-600"
									>
										Note
									</Text>
									<Text
										style={{ fontFamily: "InterSemiBold" }}
										className="text-sm text-black tracking-tighter"
									>
										Payment for the month of June
									</Text>
								</View>

								<View className="w-full flex flex-col justify-between">
									<Text
										style={{ fontFamily: "Suprapower" }}
										className="text-sm text-gray-600"
									>
										Date
									</Text>
									<Text
										style={{ fontFamily: "InterSemiBold" }}
										className="text-sm text-black tracking-tighter"
									>
										Monday, June 9th 2024, at 12:00 PM
									</Text>
								</View>
							</View>
							<Svg
								height={12}
								width={"100%"}
								fill={
									Platform.OS === "android"
										? "#F3F4F6"
										: "#fff"
								}
								stroke={
									Platform.OS === "android"
										? "#F3F4F6"
										: "#fff"
								}
							>
								{renderZigZagView()}
							</Svg>
						</View>
					</View>
				</View>
			</BottomSheetModal>
			<View className="flex flex-col">
				<View className="flex flex-row w-full justify-between items-center">
					<Text
						style={{ fontFamily: "InterSemiBold" }}
						className="text-base text-gray-700 tracking-tighter"
					>
						Transaction History
					</Text>
				</View>
				{transactionData.map((data, index) => (
					<TransactionHistoryCard
						data={data}
						key={index}
						onPress={handlePresentModalPress}
					/>
				))}
			</View>
		</View>
	);
}
