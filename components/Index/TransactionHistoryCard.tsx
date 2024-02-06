import { ArrowNarrowDownRightIcon } from "../SVG/icons";
import { View, Text } from "../styled";

export default function TransactionHistoryCard() {
	return (
		<View className="w-full border-b border-gray-100 py-5 flex flex-row items-center space-x-3.5">
			<View className="relative items-center justify-center">
				<View className="flex items-center justify-center bg-green-100 rounded-full h-9 w-9" />
				<ArrowNarrowDownRightIcon
					width={16}
					height={16}
					style={{ position: "absolute" }}
					stroke="#15803D"
				/>
			</View>

			<View className="flex flex-col flex-grow">
				<View className="flex flex-row justify-between">
					<Text
						style={{ fontFamily: "InterBold" }}
						className="text-base"
					>
						House Rent
					</Text>
					<Text
						style={{ fontFamily: "InterSemiBold" }}
						className="text-base text-green-600"
					>
						+$10,000
					</Text>
				</View>

				<View className="flex flex-row justify-between">
					<Text
						style={{ fontFamily: "InterSemiBold" }}
						className="text-sm text-gray-500"
					>
						House Rent
					</Text>
					<Text
						style={{ fontFamily: "InterSemiBold" }}
						className="text-sm text-gray-500"
					>
						June 9, 9:30 PM
					</Text>
				</View>
			</View>
		</View>
	);
}
