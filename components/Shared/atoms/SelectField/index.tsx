import { ChevronDownIcon } from "@/components/SVG/16x16";
import { ArrowNarrowUpRightIcon } from "@/components/SVG/icons";
import {
	View,
	Text,
	InputField,
	TouchableOpacity,
	BottomSheetModal,
	LinearGradient,
} from "@/components/Shared/styled";
import { truncateStringIfLongerThan } from "@/utils/string";
import BottomSheet, {
	BottomSheetBackdropProps,
	BottomSheetBackdrop,
	BottomSheetModal as TBottomSheetModal,
	BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { useRef, useMemo, useCallback, useEffect } from "react";
import { Platform } from "react-native";
import Svg from "react-native-svg";
import CustomBottomSheetModal from "../../molecules/GlobalBottomSheetModal";
import { useBottomSheetModalStore } from "../../molecules/GlobalBottomSheetModal/hooks";
import CustomBottomSheetFlatList from "../../molecules/GlobalBottomSheetFlatList";
import { useBottomSheetFlatListStore } from "../../molecules/GlobalBottomSheetFlatList/hooks";

type SelectFieldProps = {
	outerClassName?: string;
	labelClassName?: string;
	inputClassName?: string;

	label?: string;
};

export default function SelectField(props: SelectFieldProps) {
	const { setShowBottomSheetFlatList, createBottomSheetFlatList } =
		useBottomSheetFlatListStore();

	useEffect(() => {
		createBottomSheetFlatList("globalSelectField");
	}, []);

	return (
		<>
			<CustomBottomSheetFlatList
				sheetKey="globalSelectField"
				data={[
					{
						id: "1",
						name: "Hello World",
					},
				]}
				renderItem={({ item }) => <Text>{item.name}</Text>}
			>
				<Text>HELLO WORLD</Text>
			</CustomBottomSheetFlatList>
			<View className="flex flex-col space-y-1">
				{props.label && (
					<Text
						style={{ fontFamily: "InterBold" }}
						className="text-xs text-gray-500"
					>
						{props.label}
					</Text>
				)}
				<TouchableOpacity
					// onPress={handlePresentModalPress}
					onPress={() =>
						setShowBottomSheetFlatList("globalSelectField", true)
					}
					className="flex flex-row items-center space-x-2 bg-gray-100 rounded-lg p-2 text-sm border border-gray-200 h-12 relative"
				>
					<View className="absolute right-4">
						<ChevronDownIcon stroke={"#8B5CF6"} />
					</View>

					<Text
						style={{ fontFamily: "InterBold" }}
						className="text-xs text-gray-900"
					>
						{truncateStringIfLongerThan(
							`Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Quaerat quos tempora ea odit nisi, sed quam. Ullam ea minima
                        voluptatum quis maiores doloremque id cupiditate facilis
                        laudantium. Minima, molestias deleniti.`,
							50
						)}
					</Text>
				</TouchableOpacity>
			</View>
		</>
	);
}
