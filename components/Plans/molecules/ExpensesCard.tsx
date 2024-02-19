import { useState } from "react";
import { LinearGradient, Text, View } from "@/components/Shared/styled";

type ExpensesCardProps = {
	accountCurrency: string;
	accountBalance: number;
	accountName: string;
	cardBackgroundColour: string;
	cardTintColour: string;
};

export default function ExpensesCard() {
	return (
		<LinearGradient
			className="w-full p-5 rounded-2xl flex flex-col justify-center items-center space-y-4 relative"
			// style={{ backgroundColor: item.cardBackgroundColour }}
			colors={["#c084fc", "#9333ea"]}
		>
			<View className="flex flex-col w-full">
				<Text
					style={{ fontFamily: "Suprapower" }}
					className="text-white text-2xl"
				>
					GHS 10000
				</Text>
				<Text
					style={{ fontFamily: "InterSemiBold" }}
					className="text-white text-sm tracking-tighter"
				>
					Remaining for this month
				</Text>
			</View>

			<View className="flex flex-col items-start w-full space-y-2.5">
				<View className="relative w-full">
					<View className="h-2 w-full rounded-full bg-gray-100" />
					<View
						className="h-2 bg-purple-300 rounded-full absolute"
						style={{
							width: `30%`,
						}}
					/>
				</View>

				<Text
					style={{ fontFamily: "InterSemiBold" }}
					className="text-white text-sm tracking-tighter truncate"
				>
					Spent GHS 120,000 of GHS 240,000
				</Text>
			</View>

			<View className="border-b border-purple-300 w-full" />

			<View className="w-full items-start">
				<Text
					style={{ fontFamily: "InterSemiBold" }}
					className="text-white text-sm tracking-tighter truncate"
				>
					You're still on track for this month's expenses.
				</Text>
			</View>
		</LinearGradient>
	);
}
