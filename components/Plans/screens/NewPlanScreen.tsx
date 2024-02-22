import DatePicker from "@/components/Shared/atoms/DatePicker";
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
						className="bg-gray-100 rounded-lg px-4 text-xs border border-gray-200 h-12 text-gray-900"
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
						Amount
					</Text>

					<InputField
						className="bg-gray-100 rounded-lg px-4 text-xs border border-gray-200 h-12 text-gray-900"
						style={{ fontFamily: "InterSemiBold" }}
						cursorColor={"#8B5CF6"}
						placeholder="0.00"
					/>
				</View>

				<View className="h-1 border-b border-gray-100 w-full" />

				<Text
					style={{ fontFamily: "Suprapower" }}
					className="text-base text-black"
				>
					Plan Details
				</Text>

				<View className="flex flex-col space-y-1">
					<DatePicker label="Start Date" />
				</View>
			</ScrollView>

			<TouchableOpacity className="items-center w-full justify-center px-4 absolute bottom-5">
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
