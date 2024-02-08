import ArrowCircleDownIcon from "@/components/SVG/28x28";
import {
	BottomSheetBackdrop,
	BottomSheetBackdropProps,
	BottomSheetModal as TBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useCallback, useMemo, useRef } from "react";
import { BottomSheetModal, Text, View } from "../../styled";
import { transactionData } from "../constants";
import TransactionHistoryCard from "./TransactionHistoryCard";
import App from "./Zig";

export default function TransactionHistoryList() {
	// ref
	const bottomSheetModalRef = useRef<TBottomSheetModal>(null);

	// variables
	const snapPoints = useMemo(() => ["50%", "75%"], []);

	// callbacks
	const handlePresentModalPress = useCallback(() => {
		bottomSheetModalRef.current?.present();
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
					backgroundColor: "white", // <==== HERE
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
			>
				<View className="w-full flex flex-col items-center space-y-3.5 p-5">
					{/* <View className="relative items-center justify-center">
						<View className="flex items-center justify-center rounded-full h-[68px] w-[68px] bg-green-400 absolute" />
						<View className="flex items-center justify-center rounded-full h-16 w-16 border-[3px] border-white bg-green-100" />
						<ArrowCircleDownIcon
							style={{ position: "absolute" }}
							stroke={"#047857"}
						/>
					</View>
					<Text>Awesome 🎉</Text> */}
					<App />
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
