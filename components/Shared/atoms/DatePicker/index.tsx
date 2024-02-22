import { CalendarIcon } from "@/components/SVG/16x16";
import { Text, TouchableOpacity, View } from "@/components/Shared/styled";

type DatePickerProps = {
	label?: string;
};

export default function DatePicker({ label }: DatePickerProps) {
	return (
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
				onPress={() => alert("globalDatePicker")}
				className="flex flex-row items-center space-x-2 bg-gray-100 rounded-lg px-2 text-sm border border-gray-200 h-12 relative"
			>
				<View className="absolute right-4">
					<CalendarIcon stroke={"#8B5CF6"} />
				</View>

				<Text
					style={{ fontFamily: "InterSemiBold" }}
					className="text-xs text-gray-900"
				>
					9/10/9
				</Text>
			</TouchableOpacity>
		</View>
	);
}
