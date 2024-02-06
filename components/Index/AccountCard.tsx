import { formatCurrencyAccurate, formatCurrencyRounded } from "@/utils/number";
import { useState } from "react";
import { CoinSwapIcon, EyeCloseIcon, EyeOpenIcon } from "../SVG/icons";
import { LinearGradient, Text, View } from "../styled";

type AccountCard = {
	accountCurrency: string;
	accountBalance: number;
	accountName: string;
	cardBackgroundColour: string;
	cardTintColour: string;
};

export default function AccountCard({ item }: { item: AccountCard }) {
	// show/hide the account balance
	const [showAmount, setShowAmount] = useState(true);

	return (
		<LinearGradient
			className="w-full p-5 rounded-2xl flex flex-col justify-center items-center space-y-4 relative"
			// style={{ backgroundColor: item.cardBackgroundColour }}
			colors={["#c084fc", "#9333ea"]}
		>
			<View className="flex flex-row space-x-2 items-center">
				<Text
					style={{ fontFamily: "Suprapower" }}
					className="text-white text-base"
				>
					Available Balance
				</Text>
				{showAmount ? (
					<EyeOpenIcon
						width={16}
						height={16}
						stroke={"#fff"}
						onPress={() => setShowAmount(!showAmount)}
					/>
				) : (
					<EyeCloseIcon
						width={16}
						height={16}
						stroke={"#fff"}
						onPress={() => setShowAmount(!showAmount)}
					/>
				)}
			</View>

			<View className="flex flex-col items-center">
				<Text
					style={{ fontFamily: "Suprapower" }}
					className="text-white text-2xl"
				>
					{showAmount
						? item.accountBalance > 9_999_999
							? formatCurrencyRounded(
									item.accountBalance,
									item.accountCurrency
							  )
							: formatCurrencyAccurate(
									item.accountCurrency,
									item.accountBalance
							  )
						: "GHS ******"}
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
					className="flex-grow rounded-full px-2 py-1 flex items-center justify-center h-12 bg-purple-100"
					// style={{ backgroundColor: item.cardTintColour }}
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
		</LinearGradient>
	);
}
