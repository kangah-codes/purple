import { formatCurrencyAccurate, formatCurrencyRounded } from "@/utils/number";
import { useState } from "react";
import {
	ArrowCircleDownIcon,
	ArrowCircleUpIcon,
	CoinSwapIcon,
	DotsHorizontalIcon,
	EyeCloseIcon,
	EyeOpenIcon,
	PiggyBankIcon,
} from "../../SVG/icons";
import { LinearGradient, Text, View } from "../../styled";

type AlternateAccountCardProps = {
	accountCurrency: string;
	accountBalance: number;
	accountName: string;
	cardBackgroundColour: string;
	cardTintColour: string;
};

export default function AlternateAccountCard({
	item,
}: {
	item: AlternateAccountCardProps;
}) {
	// show/hide the account balance
	const [showAmount, setShowAmount] = useState(true);

	return (
		<View className="w-full flex flex-col space-y-1.5 relative">
			<View className="flex flex-row space-x-2 items-center">
				<Text
					style={{ fontFamily: "Suprapower" }}
					className="text-gray-400 text-base"
				>
					Available Balance
				</Text>
				{showAmount ? (
					<EyeOpenIcon
						width={16}
						height={16}
						stroke={"rgb(156 163 175)"}
						onPress={() => setShowAmount(!showAmount)}
					/>
				) : (
					<EyeCloseIcon
						width={16}
						height={16}
						stroke={"rgb(156 163 175)"}
						onPress={() => setShowAmount(!showAmount)}
					/>
				)}
			</View>

			<View className="flex flex-col space-y-1.5">
				<View className="flex flex-row items-end">
					<Text
						style={{ fontFamily: "InterSemiBold" }}
						className="text-black text-4xl tracking-[-0.75em]"
					>
						$45,300
					</Text>
					<Text
						style={{ fontFamily: "InterMedium" }}
						className="text-gray-500 text-2xl tracking-tighter"
					>
						.86
					</Text>
					<Text
						style={{ fontFamily: "InterMedium" }}
						className="text-gray-500 text-base tracking-tighter"
					>
						{" "}
						USD
					</Text>
				</View>
				<Text
					style={{ fontFamily: "InterMedium" }}
					className="text-gray-500 text-base tracking-tighter"
				>
					{item.accountName}
				</Text>
			</View>

			<View className="py-2.5">
				<View className="h-[1px] bg-gray-200 w-full" />
			</View>

			<View className="flex flex-row flex-grow justify-between space-x-2 items-stretch w-full px-7">
				<View className="flex flex-col items-center justify-center space-y-1.5">
					<LinearGradient
						className="w-14 h-14 rounded-full flex flex-col items-center justify-center space-y-1.5 relative"
						// style={{ backgroundColor: item.cardBackgroundColour }}
						colors={["#c084fc", "#9333ea"]}
					>
						<ArrowCircleDownIcon
							width={24}
							height={24}
							stroke="#fff"
						/>
					</LinearGradient>
					<Text
						style={{ fontFamily: "InterMedium" }}
						className="text-gray-800 text-sm tracking-tighter"
					>
						Income
					</Text>
				</View>
				<View className="flex flex-col items-center justify-center space-y-1.5">
					<LinearGradient
						className="w-14 h-14 rounded-full flex flex-col items-center justify-center space-y-1.5 relative"
						// style={{ backgroundColor: item.cardBackgroundColour }}
						colors={["#c084fc", "#9333ea"]}
					>
						<ArrowCircleUpIcon
							width={24}
							height={24}
							stroke="#fff"
						/>
					</LinearGradient>
					<Text
						style={{ fontFamily: "InterMedium" }}
						className="text-gray-800 text-sm tracking-tighter"
					>
						Expense
					</Text>
				</View>
				<View className="flex flex-col items-center justify-center space-y-1.5">
					<LinearGradient
						className="w-14 h-14 rounded-full flex flex-col items-center justify-center space-y-1.5 relative"
						// style={{ backgroundColor: item.cardBackgroundColour }}
						colors={["#c084fc", "#9333ea"]}
					>
						<CoinSwapIcon width={24} height={24} stroke="#fff" />
					</LinearGradient>
					<Text
						style={{ fontFamily: "InterMedium" }}
						className="text-gray-800 text-sm tracking-tighter"
					>
						Transfer
					</Text>
				</View>
				<View className="flex flex-col items-center justify-center space-y-1.5">
					<LinearGradient
						className="w-14 h-14 rounded-full flex flex-col items-center justify-center space-y-1.5 relative"
						// style={{ backgroundColor: item.cardBackgroundColour }}
						colors={["#c084fc", "#9333ea"]}
					>
						<PiggyBankIcon width={24} height={24} stroke="#fff" />
					</LinearGradient>
					<Text
						style={{ fontFamily: "InterMedium" }}
						className="text-gray-800 text-sm tracking-tighter"
					>
						Budget
					</Text>
				</View>
			</View>
		</View>
	);
}
