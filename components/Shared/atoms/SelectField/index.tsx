import { ChevronDownIcon } from "@/components/SVG/16x16";
import { Text, TouchableOpacity, View } from "@/components/Shared/styled";
import { truncateStringIfLongerThan } from "@/utils/string";
import { Portal } from "@gorhom/portal";
import { useEffect, useState } from "react";
import CustomBottomSheetFlatList from "../../molecules/GlobalBottomSheetFlatList";
import { useBottomSheetFlatListStore } from "../../molecules/GlobalBottomSheetFlatList/hooks";

type SelectFieldProps = {
	label?: string;
	options: {
		[key: string]: { value: string | number | boolean; label: string };
	};
};

export default function SelectField({ label, options }: SelectFieldProps) {
	const { setShowBottomSheetFlatList, createBottomSheetFlatList } =
		useBottomSheetFlatListStore();
	const [value, setValue] = useState<string | undefined>(undefined);

	useEffect(() => {
		createBottomSheetFlatList("globalSelectField");
	}, []);

	return (
		<>
			<Portal>
				<CustomBottomSheetFlatList
					children={
						label && (
							<View className="px-5 py-1">
								<Text
									style={{ fontFamily: "Suprapower" }}
									className="text-base text-gray-900"
								>
									{label}
								</Text>
							</View>
						)
					}
					sheetKey="globalSelectField"
					data={Object.keys(options).map((key) => options[key]) ?? []}
					renderItem={({ item }) => (
						<TouchableOpacity
							onPress={() => {
								setValue(item.value.toString());
								// close the bottom sheet
								setShowBottomSheetFlatList(
									"globalSelectField",
									false
								);
							}}
							className="py-3 border-b border-gray-200"
						>
							<Text
								style={{ fontFamily: "InterSemiBold" }}
								className="text-sm text-gray-800"
							>
								{item.label}
							</Text>
						</TouchableOpacity>
					)}
					containerStyle={{
						paddingHorizontal: 20,
					}}
					handleIndicatorStyle={{
						backgroundColor: "#D4D4D4",
					}}
					flatListContentContainerStyle={{
						paddingBottom: 100,
						paddingHorizontal: 20,
						// paddingTop: 20,
						backgroundColor: "white",
					}}
				/>
			</Portal>

			<View className="flex flex-col space-y-1">
				{label && (
					<Text
						style={{ fontFamily: "InterBold" }}
						className="text-xs text-gray-500"
					>
						{label}
					</Text>
				)}
				<TouchableOpacity
					// onPress={handlePresentModalPress}
					onPress={() =>
						setShowBottomSheetFlatList("globalSelectField", true)
					}
					className="flex flex-row items-center space-x-2 bg-gray-100 rounded-lg px-2 text-sm border border-gray-200 h-12 relative"
				>
					<View className="absolute right-4">
						<ChevronDownIcon stroke={"#8B5CF6"} />
					</View>

					<Text
						style={{ fontFamily: "InterSemiBold" }}
						className="text-xs text-gray-900"
					>
						{truncateStringIfLongerThan(
							options[value ?? ""]?.label ??
								`Select an option...`,
							45
						)}
					</Text>
				</TouchableOpacity>
			</View>
		</>
	);
}
