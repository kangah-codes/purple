import { View } from "@/components/Shared/styled";
import { ScrollView } from "react-native";
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";
import { Dimensions } from "react-native";
import Heatmap, { CellData } from "@/components/Shared/molecules/Heatmap";

export default function StatsHeatmap() {
	const now = new Date("2024-02-02");
	const start = startOfMonth(now);
	const end = endOfMonth(now);
	const monthDays = eachDayOfInterval({ start, end });
	const deviceWidth = Dimensions.get("window").width;
	const padding = 20;
	const numBlocksPerRow = 7; // for a week view

	// Subtract the padding from the device width and divide by the number of blocks per row
	const blockSize = (deviceWidth - padding * 2 - 28) / numBlocksPerRow;

	// Generate random heatmap values for each day of the month
	const values = monthDays.map(() => Math.floor(Math.random() * 24));
	console.log(blockSize, values, deviceWidth);

	const click = (item: CellData) => {
		alert(`You clicked on ${format(monthDays[item.index], "dd/MM/yyyy")}`);
	};

	return (
		<View className="flex">
			<Heatmap
				cellSize={blockSize}
				rows={4}
				cols={7}
				data={monthDays.map((day, index) => ({
					value: values[index],
					key: format(day, "dd/MM/yyyy"),
					index,
				}))}
				onPressCallback={click}
			/>
		</View>
	);
}
