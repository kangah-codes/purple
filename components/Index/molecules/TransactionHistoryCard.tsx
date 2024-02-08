import { useRef, useMemo, useCallback } from "react";
import {
	ArrowNarrowDownRightIcon,
	ArrowNarrowUpRightIcon,
} from "../../SVG/icons";
import { View, Text, TouchableOpacity, BottomSheetModal } from "../../styled";
import { BottomSheetModal as TBottomSheetModal } from "@gorhom/bottom-sheet";

type TransactionHistoryCardProps = {
	data: {
		type: string;
		category: string;
		description: string;
		amount: string;
		dateTime: string;
	};
	onPress: () => void;
};

export default function TransactionHistoryCard({
	data,
	onPress,
}: TransactionHistoryCardProps) {
	return (
		<TouchableOpacity
			onPress={onPress}
			className="w-full border-b border-gray-100 py-5 flex flex-row items-center space-x-3.5"
		>
			<View className="relative items-center justify-center">
				<View
					className="flex items-center justify-center rounded-full h-9 w-9"
					style={{
						backgroundColor:
							data.type === "debit"
								? "#FEE2E2"
								: "rgb(220 252 231)",
					}}
				/>
				{data.type === "debit" ? (
					<ArrowNarrowUpRightIcon
						width={16}
						height={16}
						style={{ position: "absolute" }}
						stroke={"#B91C1C"}
					/>
				) : (
					<ArrowNarrowDownRightIcon
						width={16}
						height={16}
						style={{ position: "absolute" }}
						stroke={"#047857"}
					/>
				)}
			</View>

			<View className="flex flex-col flex-grow">
				<View className="flex flex-row justify-between">
					<Text
						style={{ fontFamily: "InterBold" }}
						className="text-base tracking-tighter"
					>
						{data.category}
					</Text>
					<Text
						style={{
							fontFamily: "InterSemiBold",
							color:
								data.type === "debit"
									? "#DC2626"
									: "rgb(22 163 74)",
						}}
						className="text-base tracking-tighter"
					>
						{data.type === "debit" ? "-" : "+"}
						{data.amount}
					</Text>
				</View>

				<View className="flex flex-row justify-between">
					<Text
						style={{ fontFamily: "InterSemiBold" }}
						className="text-sm text-gray-500 tracking-tighter"
					>
						{data.description}
					</Text>
					<Text
						style={{ fontFamily: "InterSemiBold" }}
						className="text-sm text-gray-500 tracking-tighter"
					>
						{data.dateTime}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
}
