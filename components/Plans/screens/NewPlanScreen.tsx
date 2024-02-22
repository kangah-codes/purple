import SelectField from "@/components/Shared/atoms/SelectField";
import {
	InputField,
	SafeAreaView,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "@/components/Shared/styled";
import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetBackdropProps,
	BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import ExpoStatusBar from "expo-status-bar/build/ExpoStatusBar";
import { useCallback, useEffect, useMemo, useRef } from "react";

export default function NewPlanScreen() {
	const sheetRef = useRef<BottomSheet>(null);
	// variables
	const snapPoints = useMemo(() => ["25%", "65%"], []);

	const data = useMemo(
		() =>
			Array(50)
				.fill(0)
				.map((_, index) => `index-${index}`),
		[]
	);

	useEffect(() => {
		handleClosePress();
	}, []);

	// callbacks
	const handleSheetChange = useCallback((index: number) => {
		console.log("handleSheetChange", index);
	}, []);
	const handleSnapPress = useCallback((index: number) => {
		sheetRef.current?.snapToIndex(index);
	}, []);
	const handleClosePress = useCallback(() => {
		sheetRef.current?.close();
	}, []);

	const renderItem = useCallback(
		({ item }: any) => (
			<View className="">
				<Text>{item}</Text>
			</View>
		),
		[]
	);

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
		<SafeAreaView className="bg-white relative h-full">
			<ExpoStatusBar style="dark" />
			<ScrollView className="space-y-5 flex-1 flex flex-col p-5">
				<View className="flex flex-col space-y-1">
					<Text
						style={{ fontFamily: "InterBold" }}
						className="text-xs text-gray-500"
					>
						Plan Name
					</Text>

					<InputField
						className="bg-gray-100 rounded-lg px-4 text-xs border border-gray-200 h-12"
						style={{ fontFamily: "InterSemiBold" }}
						cursorColor={"#8B5CF6"}
					/>
				</View>

				<View>
					<SelectField
						label="Category"
						options={{
							kanye: {
								label: "Kanye",
								value: "kanye",
							},
							rihanna: {
								label: "Rihanna",
								value: "rihanna",
							},
							drake: {
								label: "Drake",
								value: "drake",
							},
						}}
					/>
				</View>

				<View className="flex flex-col space-y-1">
					<Text
						style={{ fontFamily: "InterBold" }}
						className="text-xs text-gray-500"
					>
						Plan Name
					</Text>

					<InputField
						className="bg-gray-100 rounded-lg py-2 px-4 text-sm border border-gray-200"
						style={{ fontFamily: "InterSemiBold" }}
						cursorColor={"#8B5CF6"}
					/>
				</View>
			</ScrollView>

			<BottomSheet
				ref={sheetRef}
				snapPoints={snapPoints}
				onChange={handleSheetChange}
				backdropComponent={renderBackdrop}
				index={-1}
				handleIndicatorStyle={{
					backgroundColor: "#D4D4D4",
				}}
			>
				<BottomSheetFlatList
					data={data}
					keyExtractor={(i) => i}
					renderItem={renderItem}
					// contentContainerStyle={styles.contentContainer}
					contentContainerStyle={{
						paddingBottom: 100,
						paddingHorizontal: 20,
						paddingTop: 20,
					}}
				></BottomSheetFlatList>
			</BottomSheet>

			<TouchableOpacity
				className="items-center w-full justify-center px-4 absolute bottom-5"
				onPress={() => handleSnapPress(0)}
			>
				<View className="bg-purple-600 py-4 w-full flex items-center justify-center rounded-full">
					<Text
						style={{
							fontFamily: "Suprapower",
						}}
						className="text-white"
					>
						Create Plan
					</Text>
				</View>
			</TouchableOpacity>
		</SafeAreaView>
	);
}
