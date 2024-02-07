import { Text, TouchableOpacity, View } from "../../styled";

type SavingPlanCardProps = {
	category: string;
	percentageCompleted: number;
	name: string;
	currentAmount: number;
	targetAmount: number;
};

export default function SavingPlanCard({
	data,
	index,
}: {
	data: SavingPlanCardProps;
	index: number;
}) {
	return (
		<TouchableOpacity
			className="p-4 border border-gray-200 rounded-xl flex flex-col w-72 space-y-2.5"
			style={{
				marginLeft: index !== 0 ? 20 : 0,
			}}
			onLongPress={() => alert("Chale chale you be broke")}
		>
			<View className="flex flex-row w-full justify-between items-center">
				<Text
					style={{
						fontFamily: "InterSemiBold",
					}}
					className="text-base text-gray-700"
				>
					{data.category}
				</Text>

				<View className="rounded-full bg-purple-600 px-2.5 py-0.5">
					<Text
						style={{
							fontFamily: "InterMedium",
						}}
						className="text-sm text-purple-50"
					>
						{data.percentageCompleted}%
					</Text>
				</View>
			</View>

			<Text
				style={{
					fontFamily: "InterBold",
				}}
				className="text-lg text-black"
			>
				{data.name}
			</Text>

			<View className="h-[1.5px] bg-gray-100 w-full" />

			<View className="flex flex-row justify-between items-center">
				<Text
					style={{
						fontFamily: "InterBold",
					}}
					className="text-sm text-black"
				>
					₵ {data.currentAmount}
				</Text>

				<Text
					style={{
						fontFamily: "InterBold",
					}}
					className="text-sm text-gray-500"
				>
					₵ {data.targetAmount}
				</Text>
			</View>

			<View className="relative w-full">
				<View className="h-2 w-full rounded-full bg-gray-100" />
				<View
					className="h-2 bg-purple-600 rounded-full absolute"
					style={{
						width: `${data.percentageCompleted}%`,
					}}
				/>
			</View>
		</TouchableOpacity>
	);
}
